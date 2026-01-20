import OpenAI from "openai";
import { UserInput, AnalysisResult, Language, BaZiResult } from "../types";
import { calculateSolarTime, formatSolarTimeDifference } from "./solarTime";
import { calculateBaZiLocal } from "./baziCalculator";
import { analyzeBasicBaZi, BasicAnalysisResult, generatePersonalityAnalysis } from "./basicAnalysis";
import { generateExtendedAnalysis, ExtendedAnalysisResult } from "./extendedAnalysis";

// ------------------------------------------------------------------
// 配置与环境变量
// ------------------------------------------------------------------

// AI 提供商类型
type AIProvider = 'deepseek' | 'glm';

// 从环境变量读取配置
const provider = (import.meta.env.VITE_AI_PROVIDER || 'deepseek') as AIProvider;
const apiKey = import.meta.env.VITE_AI_API_KEY || "";
const baseURL = import.meta.env.VITE_AI_BASE_URL || "";
const modelId = import.meta.env.VITE_AI_MODEL || "deepseek-chat";

// 提供商默认配置
const PROVIDER_CONFIGS: Record<AIProvider, { defaultBaseURL: string; defaultModel: string }> = {
  deepseek: {
    defaultBaseURL: 'https://api.deepseek.com',
    defaultModel: 'deepseek-chat'
  },
  glm: {
    defaultBaseURL: 'https://open.bigmodel.cn/api/paas/v4/',
    defaultModel: 'glm-4-flash'
  }
};

// 使用配置中的默认值或环境变量覆盖
const finalBaseURL = baseURL || PROVIDER_CONFIGS[provider].defaultBaseURL;
const finalModel = modelId || PROVIDER_CONFIGS[provider].defaultModel;

console.log(`🤖 AI Provider: ${provider}`);
console.log(`📡 Base URL: ${finalBaseURL}`);
console.log(`🎯 Model: ${finalModel}`);

// 初始化 OpenAI 客户端（所有提供商都兼容 OpenAI API）
const client = new OpenAI({
  apiKey: apiKey,
  baseURL: finalBaseURL,
  dangerouslyAllowBrowser: true
});

// ------------------------------------------------------------------
// 辅助函数：错误检测
// ------------------------------------------------------------------

const isQuotaExhaustedError = (error: any): boolean => {
  if (!error) return false;

  const errorMessage = error.message?.toLowerCase() || '';
  const errorString = error.toString().toLowerCase();

  const quotaPatterns = [
    'quota',
    'rate limit',
    'too many requests',
    '429',
    'resource exhausted',
    'insufficient_quota',
    'quota_exceeded',
    'insufficient balance',
    'balance insufficient'
  ];

  return quotaPatterns.some(pattern =>
    errorMessage.includes(pattern) || errorString.includes(pattern)
  );
};

// ------------------------------------------------------------------
// JSON Schema 定义（用于 prompt）
// ------------------------------------------------------------------

const baziCalculationSchemaPrompt = `
你是一个八字命理专家。请根据用户提供的出生信息计算八字，并返回 ONLY 符合以下 JSON 格式的结果（不要 markdown，不要代码块）：

{
  "solarTime": "字符串 - 真太阳时，格式 HH:mm",
  "lunarDate": "字符串 - 农历日期表示（例如：'1990年腊月初五'）",
  "bazi": {
    "year": { "gan": "字符串-年干", "zhi": "字符串-年支" },
    "month": { "gan": "字符串-月干", "zhi": "字符串-月支" },
    "day": { "gan": "字符串-日干", "zhi": "字符串-日支" },
    "hour": { "gan": "字符串-时干", "zhi": "字符串-时支" }
  },
  "startAge": "整数 - 起运岁数",
  "direction": "字符串 - 顺行或逆行",
  "daYun": ["字符串数组 - 大运柱列表，例如 ['甲子', '乙丑']，前8-10个"]
}

要求：
1. 根据出生地计算真太阳时
2. 转换为农历日期
3. 准确排列年、月、日、时四柱
4. 计算起运岁数和顺逆方向
5. 列出前8-10个大运柱

只返回 JSON，不要任何其他解释文字。
`;

const analysisSchemaPrompt = `
你是一个八字大师和金融分析师。请根据确认的八字信息，生成人生K线分析，返回 ONLY 符合以下 JSON 格式的结果（不要 markdown，不要代码块）：

{
  "mainAttribute": "字符串 - 命主属性，例如'弱火命'、'强金命'",
  "generalComment": "字符串 - 命运总述，2-3句话",
  "cryptoFortune": {
    "content": "字符串 - 币圈/Web3交易运势分析",
    "rating": "整数 - 评分1-10"
  },
  "personality": {
    "content": "字符串 - 性格分析",
    "rating": "整数 - 评分1-10"
  },
  "career": {
    "content": "字符串 - 事业与行业分析",
    "rating": "整数 - 评分1-10"
  },
  "fengShui": {
    "content": "字符串 - 发展风水建议",
    "rating": "整数 - 评分1-10"
  },
  "wealth": {
    "content": "字符串 - 财富层级分析",
    "rating": "整数 - 评分1-10"
  },
  "marriage": {
    "content": "字符串 - 婚姻情感分析",
    "rating": "整数 - 评分1-10"
  },
  "volatilityAnalysis": "字符串 - K线波动逻辑解析，解释为什么运势会这样起伏",
  "timeline": [
    {
      "year": "整数 - 公历年份（例如2002）",
      "age": "整数 - 虚岁（例如1）",
      "open": "整数 - 开盘值 0-100",
      "close": "整数 - 收盘值 0-100",
      "high": "整数 - 最高值 0-100",
      "low": "整数 - 最低值 0-100",
      "summary": "字符串 - 年度简短总结",
      "detailedReview": "字符串 - 年度详细点评，1-2句话",
      "isPeak": "布尔值 - 大多数年份为false"
    }
  ]
}

重要要求：
1. timeline 数组必须包含**恰好100个条目**，从出生年开始
2. 条目1：year = 出生年, age = 1
3. 条目100：year = 出生年+99, age = 100
4. 必须同时生成牛市年（close > open，绿色K线）和熊市年（close < open，红色K线）
5. 不要让所有年份都是绿色，要有真实的波动
6. 大运在起运岁数开始，之前由月柱和小运决定
7. 评分要客观合理，1-10分
8. 内容要基于八字理论分析

只返回 JSON，不要任何其他解释文字。
`;

// ------------------------------------------------------------------
// API 调用函数
// ------------------------------------------------------------------

/**
 * 调用 AI 模型生成 JSON 响应
 */
async function callAI(prompt: string, systemPrompt?: string): Promise<any> {
  try {
    const messages: any[] = [
      { role: "user", content: prompt }
    ];

    if (systemPrompt) {
      messages.unshift({ role: "system", content: systemPrompt });
    }

    const response = await client.chat.completions.create({
      model: finalModel,
      messages: messages,
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 16000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("AI 返回空响应");
    }

    return JSON.parse(content);
  } catch (error: any) {
    console.error("AI API Error:", error);

    // 检查是否为配额耗尽错误
    if (isQuotaExhaustedError(error)) {
      throw new Error("QUOTA_EXHAUSTED");
    }

    throw error;
  }
}

// ------------------------------------------------------------------
// 1. 计算八字（初步步骤）
// ------------------------------------------------------------------

export const calculateBaZi = async (input: UserInput): Promise<BaZiResult> => {
  // -------------------------------------------------------------------
  // 1. 本地计算真太阳时
  // -------------------------------------------------------------------
  let solarTimeData;
  try {
    solarTimeData = await calculateSolarTime(
      input.birthDate,
      input.birthTime,
      input.birthLocation
    );
    console.log('✓ 真太阳时计算完成:', solarTimeData.solarTime);
    console.log('  - 原始时间:', input.birthTime);
    console.log('  - 真太阳时:', solarTimeData.solarTime);
    console.log('  - 时辰:', solarTimeData.solarHour);
    console.log('  - 经度:', solarTimeData.longitude);
    console.log('  - 纬度:', solarTimeData.latitude);
  } catch (error) {
    console.error('真太阳时计算失败:', error);
    solarTimeData = {
      solarTime: input.birthTime,
      longitude: 0,
      latitude: 0,
      timezone: 'Asia/Shanghai',
      solarHour: '未知',
    };
  }

  // -------------------------------------------------------------------
  // 2. 本地计算四柱八字（精确计算，不依赖AI）
  // -------------------------------------------------------------------
  let baziData;
  try {
    baziData = calculateBaZiLocal(
      input.birthDate,
      solarTimeData.solarTime,  // 使用真太阳时
      input.birthLocation
    );
    console.log('✓ 四柱计算完成:');
    console.log('  - 年柱:', baziData.pillars.year.gan + baziData.pillars.year.zhi);
    console.log('  - 月柱:', baziData.pillars.month.gan + baziData.pillars.month.zhi);
    console.log('  - 日柱:', baziData.pillars.day.gan + baziData.pillars.day.zhi);
    console.log('  - 时柱:', baziData.pillars.hour.gan + baziData.pillars.hour.zhi);
    console.log('  - 农历:', baziData.lunarDate);
    console.log('  - 起运:', baziData.startAge + '岁', baziData.direction);
  } catch (error) {
    console.error('四柱计算失败:', error);
    throw new Error('四柱计算失败，请检查输入信息');
  }

  // -------------------------------------------------------------------
  // 3. 构造结果（使用本地计算的准确数据）
  // -------------------------------------------------------------------
  return {
    bazi: baziData.pillars,
    lunarDate: baziData.lunarDate,
    solarTime: baziData.solarTime,
    startAge: baziData.startAge,
    direction: baziData.direction,
    daYun: baziData.daYun,
    userInput: input,
    originalSolarTime: solarTimeData,
  };
};

// ------------------------------------------------------------------
// 2. 生成完整分析（最终步骤）
// ------------------------------------------------------------------

export const generateDestinyAnalysis = async (
  confirmedBaZi: BaZiResult,
  lang: Language = 'zh'
): Promise<AnalysisResult> => {
  const langInstruction = lang === 'zh' ? '简体中文' : 'English';

  const baziString = JSON.stringify(confirmedBaZi.bazi);
  const daYunString = confirmedBaZi.daYun.join(", ");

  let birthYear = 1990;
  try {
    birthYear = parseInt(confirmedBaZi.userInput.birthDate.split('-')[0]);
  } catch (e) {
    console.error("Error parsing birth year", e);
  }

  // -----------------------------------------------------------------------
  // 执行本地命理分析（确保基础分析的准确性和速度）
  // -----------------------------------------------------------------------
  let basicAnalysis: BasicAnalysisResult;
  let extendedAnalysis: ExtendedAnalysisResult;
  let personalityAnalysis: any;

  console.log('🔍 开始本地基础命理分析...');
  basicAnalysis = analyzeBasicBaZi(
    confirmedBaZi.userInput.birthDate,
    confirmedBaZi.userInput.birthTime,
    confirmedBaZi.userInput.birthLocation
  );
  console.log('✅ 基础分析完成');

  console.log('🔍 开始本地扩展命理分析...');
  extendedAnalysis = generateExtendedAnalysis(basicAnalysis, confirmedBaZi.userInput);
  console.log('✅ 扩展分析完成');

  console.log('🔍 生成本地性格分析...');
  personalityAnalysis = generatePersonalityAnalysis(basicAnalysis);
  console.log('✅ 性格分析完成');

  const prompt = `
${analysisSchemaPrompt}

**基础八字数据（用户已确认，不要重新计算，直接使用）：**
- 八字：${baziString}
- 性别：${confirmedBaZi.userInput.gender}
- 大运：${daYunString}
- 起运岁数：${confirmedBaZi.startAge}
- 出生年份：${birthYear}

**本地精确分析数据（供AI参考，不要重新计算）：**
- 命主属性：${basicAnalysis.dayElement}命（${basicAnalysis.shiShenAnalysis.dayMasterType}）
- 日柱十神：${basicAnalysis.shiShenAnalysis.dayMasterShiShen}
- 命主强弱：${basicAnalysis.strengthAnalysis.strengthDescription}
- 事业潜力：${extendedAnalysis.careerAnalysis.careerScore}/10
- 财富等级：${extendedAnalysis.wealthAnalysis.wealthLevel}/10
- 婚姻评分：${extendedAnalysis.marriageAnalysis.marriageScore}/10
- 健康等级：${extendedAnalysis.healthAnalysis.healthLevel}/10
- 学习能力：${extendedAnalysis.educationAnalysis.learningAbility}/10

**命主性格特征（本地生成供参考）：**
${personalityAnalysis.content}

**AI任务（基于本地精确数据生成高级分析）：**
1. 综合本地分析数据，生成更详细的人生K线分析
2. 生成100年运势数据（K线风格：Open, Close, High, Low 范围0-100）
   - timeline 必须恰好从出生年（${birthYear}）开始
   - 条目1：year=${birthYear}, age=1（虚岁）
   - 条目100：year=${birthYear + 99}, age=100
   - 确保数组恰好100个条目
   - 大运从${confirmedBaZi.startAge}岁开始

3. **生成真实波动（重要）**：
   - 运势好的年份：Close > Open（绿色K线）
   - 运势差的年份：Close < Open（红色K线）
   - **必须同时生成牛市年和熊市年，避免所有年份都相同**

4. 基于本地数据，对以下维度进行深化分析：
   - 币圈/Web3交易运势（结合命主五行特征）
   - 性格特征（结合十神分析）
   - 事业与行业（结合事业分析数据）
   - 发展风水（结合风水建议数据）
   - 财富分析（结合财富分析数据）
   - 婚姻情感（结合婚姻分析数据）

5. 提供波动逻辑解析，说明为什么运势会这样起伏

**输出语言**：${langInstruction}

**重要**：基于本地分析的精确数据生成，不要重新计算基础命理信息。只返回 JSON，不要其他内容。
`;

  try {
    const result = await callAI(prompt);

    // -----------------------------------------------------------------------
    // 数据清洗：确保单一峰值
    // -----------------------------------------------------------------------
    let maxHigh = -Infinity;
    let maxClose = -Infinity;
    let peakIdx = -1;

    if (result.timeline && Array.isArray(result.timeline)) {
      result.timeline.forEach((item: any, idx: number) => {
        item.isPeak = false;

        if (item.high > maxHigh) {
          maxHigh = item.high;
          maxClose = item.close;
          peakIdx = idx;
        } else if (item.high === maxHigh) {
          if (item.close > maxClose) {
            maxClose = item.close;
            peakIdx = idx;
          }
        }
      });

      if (peakIdx !== -1 && result.timeline[peakIdx]) {
        result.timeline[peakIdx].isPeak = true;
      }
    }

    return {
      ...result,
      bazi: confirmedBaZi.bazi
    };
  } catch (error: any) {
    console.error("Destiny Analysis Error:", error);

    if (isQuotaExhaustedError(error)) {
      throw new Error("QUOTA_EXHAUSTED");
    }

    throw error;
  }
};
