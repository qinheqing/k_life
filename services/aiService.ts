import OpenAI from "openai";
import { UserInput, AnalysisResult, Language, BaZiResult } from "../types";
import { calculateSolarTime, formatSolarTimeDifference } from "./solarTime";
import { calculateBaZiLocal } from "./baziCalculator";
import { analyzeBasicBaZi, BasicAnalysisResult, generatePersonalityAnalysis } from "./basicAnalysis";
import { generateExtendedAnalysis, ExtendedAnalysisResult } from "./extendedAnalysis";

// ------------------------------------------------------------------
// 进度回调类型定义
// ------------------------------------------------------------------

export type ProgressCallback = (progress: number, step: string, estimatedTime?: number) => void;

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

const createMainAttributePrompt = (
  lang: string,
  baziString: string,
  daYunString: string,
  startAge: number,
  dayElement: string,
  dayMasterType: string,
  strengthDescription: string
) => `
你是一个八字命理专家。根据以下八字信息生成命主属性和总述：

**八字信息：**
- 八字四柱：${baziString}
- 大运：${daYunString}
- 起运岁数：${startAge}
- 命主属性：${dayElement}命（${dayMasterType}）
- 命主强弱：${strengthDescription}

返回 ONLY 符合以下 JSON 格式：
{
  "mainAttribute": "字符串 - 命主属性，如'弱火命'、'强金命'",
  "generalComment": "字符串 - 命运总述，3-4句话，100-150字"
}

重要要求：所有输出内容必须使用**简体中文**，不要出现英文。

只返回 JSON，不要其他内容。
`;

const createGeographicPrompt = (
  lang: string,
  dayElement: string,
  favorableElements: string,
  favorableDirections: string
) => `
你是一个八字命理专家。根据以下信息生成地理发展建议：

**八字信息：**
- 命主属性：${dayElement}命
- 喜用五行：${favorableElements}
- 有利方位：${favorableDirections}

返回 ONLY 符合以下 JSON 格式：
{
  "recommendedDirections": {
    "primary": "字符串 - 主要推荐方位（南方、北方、东方、西方、中央）",
    "secondary": "字符串 - 次要推荐方位",
    "description": "字符串 - 方位详细解释，结合五行理论，100-150字"
  },
  "recommendedCityTypes": {
    "types": ["字符串数组 - 推荐城市类型3-5个，如['一线城市', '沿海城市']"],
    "examples": ["字符串数组 - 示例城市3-5个，如['深圳', '上海', '杭州']"],
    "description": "字符串 - 城市类型详细解释，结合产业发展，150-200字"
  },
  "migrationAdvice": {
    "timing": "字符串 - 最佳迁移时机，50字左右",
    "preparation": ["字符串数组 - 准备工作2-3条"],
    "considerations": ["字符串数组 - 注意事项2-3条"]
  },
  "workplaceArrangement": "字符串 - 工作环境建议，80-100字",
  "rating": "整数 - 整体评分1-10"
}

重要要求：所有输出内容必须使用**简体中文**，不要出现英文。

只返回 JSON。
`;

const createDimensionPrompt = (
  dimension: string,
  lang: string,
  localData: Record<string, any>
) => {
  const dimensionPrompts: Record<string, string> = {
    性格: '性格特征分析',
    事业: '事业发展分析',
    风水: '风水运势分析',
    财富: '财富运势分析',
    婚姻: '婚姻情感分析'
  };

  const description = dimensionPrompts[dimension] || dimension;

  return `
你是一个八字命理专家。生成${description}：

**参考数据：**
${JSON.stringify(localData, null, 2)}

返回 ONLY 符合以下 JSON 格式：
{
  "summary": "字符串 - 精简概括，50-80字",
  "rating": "整数 - 评分1-10",
  "details": {
    "overview": "字符串 - 总体概述，100-150字",
    "strengths": ["数组 - 优势3-4条，每条50字左右"],
    "weaknesses": ["数组 - 劣势2-3条，每条50字左右"],
    "recommendations": ["数组 - 建议4-5条，每条50字左右"],
    "taboos": ["数组 - 注意事项2-3条，每条40字左右"],
    "bestTiming": "字符串 - 最佳时机，50字左右"
  }
}

重要要求：所有输出内容必须使用**简体中文**，不要出现英文。

只返回 JSON。
`;
};

const createTimelinePrompt = (
  lang: string,
  birthYear: number,
  startAge: number,
  dayElement: string
) => `
你是一个八字大师和金融分析师。生成100年人生K线：

**基础信息：**
- 出生年份：${birthYear}
- 起运岁数：${startAge}
- 命主属性：${dayElement}命

返回 ONLY 符合以下 JSON 格式：
{
  "timeline": [
    {
      "year": "整数 - 公历年份",
      "age": "整数 - 虚岁",
      "open": "整数 - 开盘值0-100",
      "close": "整数 - 收盘值0-100",
      "high": "整数 - 最高值0-100",
      "low": "整数 - 最低值0-100",
      "summary": "字符串 - 年度总结，30-50字",
      "isKeyYear": "布尔值 - 是否关键年份",
      "yearlyReview": {
        "brief": "字符串 - 普通年份简评，<100字",
        "detailed": {
          "career": "字符串 - 关键年份事业，100字左右",
          "wealth": "字符串 - 关键年份财运，80字左右",
          "health": "字符串 - 关键年份健康，80字左右",
          "advice": "字符串 - 关键年份建议，40字左右",
          "luckyColor": "字符串 - 幸运色（可选，仅关键年份）",
          "luckyNumber": "整数 - 幸运数字（可选，仅关键年份）"
        }
      }
    }
  ]
}

要求：
1. 恰好100个条目，从出生年到出生年+99
2. 条目1：year = ${birthYear}, age = 1
3. 条目100：year = ${birthYear + 99}, age = 100
4. 必须同时生成牛市年（Close > Open，绿色K线）和熊市年（Close < Open，红色K线）
5. 关键年份占15-20%：
   - 人生巅峰年份（最高high的年份）
   - 运势大幅波动年份（涨跌 > 30）
   - 大运开始的年份（${birthYear + startAge}年）
   - 流年与命盘有冲、合、害等特殊关系的年份
6. 关键年份：yearlyReview.detailed有内容，yearlyReview.brief也要有
7. 普通年份：只保留yearlyReview.brief，detailed为null
8. 评分要客观合理，基于八字理论

重要要求：所有输出内容必须使用**简体中文**，不要出现英文（如"Career"、"Wealth"等）。

只返回 JSON。
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

/**
 * 带重试的AI调用
 * @param prompt - 提示词
 * @param description - 用于日志和进度描述
 * @param maxRetries - 最大重试次数（默认3）
 * @param progressCallback - 进度回调（可选）
 */
async function callAIWithRetry(
  prompt: string,
  description: string,
  maxRetries: number = 3,
  progressCallback?: ProgressCallback
): Promise<any> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🤖 AI调用 [${description}] - 尝试 ${attempt}/${maxRetries}`);

      const result = await callAI(prompt);

      if (attempt > 1) {
        console.log(`✅ AI调用 [${description}] - 重试成功 (尝试 ${attempt})`);
      }

      return result;
    } catch (error: any) {
      lastError = error;
      console.error(`❌ AI调用 [${description}] - 尝试 ${attempt} 失败:`, error.message);

      // 如果是配额耗尽，立即抛出，不重试
      if (isQuotaExhaustedError(error)) {
        throw new Error("QUOTA_EXHAUSTED");
      }

      // 如果是最后一次尝试，抛出错误
      if (attempt === maxRetries) {
        throw new Error(`${description} 失败（已重试${maxRetries}次）: ${error.message}`);
      }

      // 等待1-2秒后重试
      const waitTime = 1000 + Math.random() * 1000;
      console.log(`⏳ ${waitTime.toFixed(0)}ms后重试...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
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
  lang: Language = 'zh',
  progressCallback?: ProgressCallback
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

  const getProgressText = (key: string): string => {
    const progressTexts: Record<string, { zh: string; en: string }> = {
      step1: { zh: '正在分析基础命理信息...', en: 'Analyzing Basic BaZi...' },
      step2: { zh: '正在分析扩展命理信息...', en: 'Analyzing Extended BaZi...' },
      step3: { zh: '正在分析性格特征...', en: 'Analyzing Personality...' },
      step4: { zh: 'AI 正在生成命主总述...', en: 'AI Generating Main Attribute...' },
      step5: { zh: 'AI 正在分析地理发展...', en: 'AI Analyzing Geographic...' },
      step6: { zh: 'AI 正在分析性格分析...', en: 'AI Analyzing Personality...' },
      step7: { zh: 'AI 正在分析事业发展...', en: 'AI Analyzing Career...' },
      step8: { zh: 'AI 正在分析风水运势...', en: 'AI Analyzing Feng Shui...' },
      step9: { zh: 'AI 正在分析财富运势...', en: 'AI Analyzing Wealth...' },
      step10: { zh: 'AI 正在分析婚姻运势...', en: 'AI Analyzing Marriage...' },
      step11: { zh: 'AI 正在生成人生K线...', en: 'AI Generating Timeline...' },
      step12: { zh: '正在合并分析结果...', en: 'Merging Results...' },
      complete: { zh: '分析完成', en: 'Analysis Complete' },
    };
    return progressTexts[key]?.[lang] || key;
  };

  // -----------------------------------------------------------------------
  // 执行本地命理分析（确保基础分析的准确性和速度）
  // -----------------------------------------------------------------------
  let basicAnalysis: BasicAnalysisResult;
  let extendedAnalysis: ExtendedAnalysisResult;
  let personalityAnalysis: any;

  console.log('🔍 开始本地基础命理分析...');
  if (progressCallback) {
    progressCallback(10, getProgressText('step1'), 20);
  }
  basicAnalysis = analyzeBasicBaZi(
    confirmedBaZi.userInput.birthDate,
    confirmedBaZi.userInput.birthTime,
    confirmedBaZi.userInput.birthLocation
  );
  console.log('✅ 基础分析完成');

  console.log('🔍 开始本地扩展命理分析...');
  if (progressCallback) {
    progressCallback(20, getProgressText('step2'), 18);
  }
  extendedAnalysis = generateExtendedAnalysis(basicAnalysis, confirmedBaZi.userInput);
  console.log('✅ 扩展分析完成');

  console.log('🔍 生成本地性格分析...');
  if (progressCallback) {
    progressCallback(30, getProgressText('step3'), 17);
  }
  personalityAnalysis = generatePersonalityAnalysis(basicAnalysis);
  console.log('✅ 性格分析完成');

  // -----------------------------------------------------------------------
  // AI调用阶段 - 7次独立调用 (35-95%)
  // -----------------------------------------------------------------------

  let mainResult: any;
  let geographicResult: any;
  let personalityResult: any;
  let careerResult: any;
  let fengShuiResult: any;
  let wealthResult: any;
  let marriageResult: any;
  let timelineResult: any;

  try {
    // AI调用1: 命主属性 & 总述 (35-40%)
    console.log('🤖 AI调用1: 命主属性与总述');
    if (progressCallback) {
      progressCallback(35, getProgressText('step4'), 15);
    }
    mainResult = await callAIWithRetry(
      createMainAttributePrompt(
        langInstruction,
        baziString,
        daYunString,
        confirmedBaZi.startAge,
        basicAnalysis.dayElement,
        basicAnalysis.shiShenAnalysis.dayMasterType,
        basicAnalysis.strengthAnalysis.strengthDescription
      ),
      '命主属性与总述',
      3
    );
    console.log('✅ AI调用1完成');
    if (progressCallback) {
      progressCallback(40, getProgressText('step4'), 12);
    }

    // AI调用2: 地理发展 (40-50%)
    console.log('🤖 AI调用2: 地理发展');
    if (progressCallback) {
      progressCallback(40, getProgressText('step5'), 12);
    }
    geographicResult = await callAIWithRetry(
      createGeographicPrompt(
        langInstruction,
        basicAnalysis.dayElement,
        extendedAnalysis.fengShuiAdvice.favorableElements.join('、'),
        extendedAnalysis.fengShuiAdvice.favorableDirections.join('、')
      ),
      '地理发展分析',
      3
    );
    console.log('✅ AI调用2完成');
    if (progressCallback) {
      progressCallback(50, getProgressText('step5'), 10);
    }

    // AI调用3: 性格分析 (50-60%)
    console.log('🤖 AI调用3: 性格分析');
    if (progressCallback) {
      progressCallback(50, getProgressText('step6'), 10);
    }
    personalityResult = await callAIWithRetry(
      createDimensionPrompt(
        '性格',
        langInstruction,
        {
          日主: basicAnalysis.dayElement,
          十神: basicAnalysis.shiShenAnalysis.dayMasterShiShen,
          强弱: basicAnalysis.strengthAnalysis.strengthDescription
        }
      ),
      '性格分析',
      3
    );
    console.log('✅ AI调用3完成');
    if (progressCallback) {
      progressCallback(60, getProgressText('step6'), 8);
    }

    // AI调用4: 事业分析 (60-70%)
    console.log('🤖 AI调用4: 事业分析');
    if (progressCallback) {
      progressCallback(60, getProgressText('step7'), 8);
    }
    careerResult = await callAIWithRetry(
      createDimensionPrompt(
        '事业',
        langInstruction,
        {
          事业潜力: `${extendedAnalysis.careerAnalysis.careerScore}/10`,
          适合职业: extendedAnalysis.careerAnalysis.suitableJobs,
          领导力: extendedAnalysis.careerAnalysis.leadershipPotential
        }
      ),
      '事业分析',
      3
    );
    console.log('✅ AI调用4完成');
    if (progressCallback) {
      progressCallback(70, getProgressText('step7'), 6);
    }

    // AI调用5: 风水分析 (70-80%)
    console.log('🤖 AI调用5: 风水分析');
    if (progressCallback) {
      progressCallback(70, getProgressText('step8'), 6);
    }
    fengShuiResult = await callAIWithRetry(
      createDimensionPrompt(
        '风水',
        langInstruction,
        {
          喜用五行: extendedAnalysis.fengShuiAdvice.favorableElements,
          有利方位: extendedAnalysis.fengShuiAdvice.favorableDirections,
          有利颜色: extendedAnalysis.fengShuiAdvice.favorableColors
        }
      ),
      '风水分析',
      3
    );
    console.log('✅ AI调用5完成');
    if (progressCallback) {
      progressCallback(80, getProgressText('step8'), 5);
    }

    // AI调用6: 财富分析 (80-90%)
    console.log('🤖 AI调用6: 财富分析');
    if (progressCallback) {
      progressCallback(80, getProgressText('step9'), 5);
    }
    wealthResult = await callAIWithRetry(
      createDimensionPrompt(
        '财富',
        langInstruction,
        {
          财富等级: `${extendedAnalysis.wealthAnalysis.wealthLevel}/10`,
          赚钱能力: extendedAnalysis.wealthAnalysis.earningAbility,
          投资天赋: extendedAnalysis.wealthAnalysis.investmentTalent
        }
      ),
      '财富分析',
      3
    );
    console.log('✅ AI调用6完成');
    if (progressCallback) {
      progressCallback(90, getProgressText('step9'), 3);
    }

    // AI调用7: 婚姻分析 (90-95%)
    console.log('🤖 AI调用7: 婚姻分析');
    if (progressCallback) {
      progressCallback(90, getProgressText('step10'), 3);
    }
    marriageResult = await callAIWithRetry(
      createDimensionPrompt(
        '婚姻',
        langInstruction,
        {
          婚姻评分: `${extendedAnalysis.marriageAnalysis.marriageScore}/10`,
          适婚年龄: extendedAnalysis.marriageAnalysis.marriageAge,
          配偶特征: extendedAnalysis.marriageAnalysis.spouseCharacteristics
        }
      ),
      '婚姻分析',
      3
    );
    console.log('✅ AI调用7完成');
    if (progressCallback) {
      progressCallback(95, getProgressText('step10'), 2);
    }

    // AI调用8: 100年Timeline (95-100%)
    console.log('🤖 AI调用8: 100年Timeline');
    if (progressCallback) {
      progressCallback(95, getProgressText('step11'), 15);
    }
    timelineResult = await callAIWithRetry(
      createTimelinePrompt(
        langInstruction,
        birthYear,
        confirmedBaZi.startAge,
        basicAnalysis.dayElement
      ),
      '人生K线生成',
      3
    );
    console.log('✅ AI调用8完成');
    if (progressCallback) {
      progressCallback(100, getProgressText('step11'), 0);
    }

    // -----------------------------------------------------------------------
    // 数据清洗与合并 (100%)
    // -----------------------------------------------------------------------
    if (progressCallback) {
      progressCallback(100, getProgressText('step12'), 0);
    }

    console.log('🔍 开始数据清洗...');

    // 清洗timeline：确保单一峰值 + 标记关键年份
    let maxHigh = -Infinity;
    let maxClose = -Infinity;
    let peakIdx = -1;

    if (timelineResult.timeline && Array.isArray(timelineResult.timeline)) {
      timelineResult.timeline.forEach((item: any, idx: number) => {
        item.isPeak = false;
        item.isKeyYear = false;

        // 找出人生巅峰（最高的high值）
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

        // 标记大幅波动年份
        const change = Math.abs(item.close - item.open);
        if (change > 30) {
          item.isKeyYear = true;
        }

        // 标记大运开始的年份
        const daYunStartYear = birthYear + confirmedBaZi.startAge;
        if (item.year === daYunStartYear) {
          item.isKeyYear = true;
        }

        // 确保isKeyYear有值
        if (item.isKeyYear === undefined) {
          item.isKeyYear = false;
        }
      });

      // 设置唯一巅峰
      if (peakIdx !== -1 && timelineResult.timeline[peakIdx]) {
        timelineResult.timeline[peakIdx].isPeak = true;
        timelineResult.timeline[peakIdx].isKeyYear = true;
      }
    }

    console.log('✅ 数据清洗完成');

    // 合并所有结果
    console.log('🔍 合并所有分析结果...');

    const result: AnalysisResult = {
      bazi: confirmedBaZi.bazi,
      mainAttribute: mainResult.mainAttribute,
      generalComment: mainResult.generalComment,
      geographicDevelopment: geographicResult,
      personality: personalityResult,
      career: careerResult,
      fengShui: fengShuiResult,
      wealth: wealthResult,
      marriage: marriageResult,
      timeline: timelineResult.timeline,
      volatilityAnalysis: `基于${basicAnalysis.dayElement}命（${basicAnalysis.shiShenAnalysis.dayMasterType}）和${basicAnalysis.strengthAnalysis.strengthDescription}的综合分析，结合${extendedAnalysis.fengShuiAdvice.favorableElements.join('、')}等喜用五行的运势起伏规律。`
    };

    console.log('✅ 所有分析完成');
    if (progressCallback) {
      progressCallback(100, getProgressText('complete'), 0);
    }

    return result;
  } catch (error: any) {
    console.error("Destiny Analysis Error:", error);

    if (isQuotaExhaustedError(error)) {
      throw new Error("QUOTA_EXHAUSTED");
    }

    throw error;
  }
};
