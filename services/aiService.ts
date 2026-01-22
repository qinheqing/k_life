import OpenAI from "openai";
import { UserInput, AnalysisResult, Language, BaZiResult, PartialAnalysisResult, AnalysisConfig } from "../types";
import { calculateSolarTime, formatSolarTimeDifference } from "./solarTime";
import { calculateBaZiLocal } from "./baziCalculator";
import { analyzeBasicBaZi, BasicAnalysisResult, generatePersonalityAnalysis } from "./basicAnalysis";
import { generateExtendedAnalysis, ExtendedAnalysisResult } from "./extendedAnalysis";
import { enhanceTimeline } from "./timelineEnhancer";
import { selectSpecialYears, createDetailedReviewPrompt } from "./specialYearSelector";

// ------------------------------------------------------------------
// 进度回调类型定义
// ------------------------------------------------------------------

export type ProgressCallback = (progress: number, step: string, estimatedTime?: number, partialResult?: any) => void;

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

// 检查API Key
if (!apiKey || apiKey.length === 0) {
  console.error('❌ API Key未设置！请在.env.local文件中设置VITE_AI_API_KEY');
  console.error('示例: VITE_AI_API_KEY=your_api_key_here');
}

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
console.log(`🔑 API Key: ${apiKey ? '已设置 (' + apiKey.slice(0, 10) + '...)' : '❌ 未设置'}`);

// 检测是否使用推理模型
const isReasonerModel = finalModel.includes('reasoner');
console.log(`🧠 模型类型: ${isReasonerModel ? '深度推理模型 (需要更多tokens)' : '普通模型'}`);

/**
 * 根据模型类型智能调整max_tokens
 */
function getAdjustedMaxTokens(baseTokens: number): number {
  // 推理模型需要预留大量tokens用于推理过程
  if (isReasonerModel) {
    // 深度推理模型通常需要1000-6000 tokens用于推理
    // 我们需要至少保留2倍的空间
    return Math.max(baseTokens * 2, 16000);
  }
  return baseTokens;
}

// 初始化 OpenAI 客户端（所有提供商都兼容 OpenAI API）
const client = new OpenAI({
  apiKey: apiKey,
  baseURL: finalBaseURL,
  dangerouslyAllowBrowser: true
});

// ------------------------------------------------------------------
// 辅助函数：结果验证
// ------------------------------------------------------------------

function normalizeTimelineData(timeline: any[], birthYear: number, startAge: number): any[] {
  if (!Array.isArray(timeline)) {
    return timeline;
  }

   // 1. 修复K线关系：确保high >= open/close, low <= open/close
   timeline.forEach((item: any) => {
     const open = item.open || 50;
     const close = item.close || 50;

     // 修复high：必须 >= open和close
     if (item.high < open || item.high < close) {
       item.high = Math.max(open, close) + Math.random() * 5;
       item.high = Math.round(Math.min(100, item.high));
     }

     // 修复low：必须 <= open和close
     if (item.low > open || item.low > close) {
       item.low = Math.min(open, close) - Math.random() * 5;
       item.low = Math.round(Math.max(0, item.low));
     }

     // 确保值在0-100范围内
     item.open = Math.round(Math.max(0, Math.min(100, item.open)));
     item.close = Math.round(Math.max(0, Math.min(100, item.close)));
     item.high = Math.round(Math.max(0, Math.min(100, item.high)));
     item.low = Math.round(Math.max(0, Math.min(100, item.low)));

     // 确保yearlyReview结构完整
     if (!item.yearlyReview || typeof item.yearlyReview !== 'object') {
       item.yearlyReview = { brief: '', detailed: null };
     }
     if (typeof item.yearlyReview.brief !== 'string') {
       item.yearlyReview.brief = '';
     }
     if (item.yearlyReview.detailed === null || item.yearlyReview.detailed === undefined) {
       item.yearlyReview.detailed = null;
     }
   });

  // 2. 设置isPeak：找出最高的high值，恰好1个巅峰
  let maxHigh = -Infinity;
  let maxClose = -Infinity;
  let peakIdx = -1;

  timeline.forEach((item: any, idx: number) => {
    item.isPeak = false;

    if (item.high > maxHigh) {
      maxHigh = item.high;
      maxClose = item.close;
      peakIdx = idx;
    } else if (item.high === maxHigh && item.close > maxClose) {
      maxClose = item.close;
      peakIdx = idx;
    }
  });

  // 设置唯一巅峰，必须在20-50岁之间
  let validPeakIdx = -1;
  for (let i = 0; i < timeline.length; i++) {
    const item = timeline[i];
    if (item.age >= 20 && item.age <= 50) {
      if (validPeakIdx === -1 || item.high > timeline[validPeakIdx].high) {
        validPeakIdx = i;
      }
    }
  }

  if (validPeakIdx !== -1) {
    timeline[validPeakIdx].isPeak = true;
  } else if (peakIdx !== -1) {
    // 如果没有符合条件的巅峰，使用最高的high值
    timeline[peakIdx].isPeak = true;
  }

  // 3. 调整isKeyYear数量：确保6-8%
  const targetKeyYears = Math.floor(timeline.length * 0.06 + Math.random() * (0.08 - 0.06) * timeline.length);
  let currentKeyYears = 0;

  // 先统计现有的关键年
  timeline.forEach((item: any) => {
    if (item.isKeyYear) {
      currentKeyYears++;
    } else {
      item.isKeyYear = false;
    }
  });

  // 如果关键年不足，添加更多
  if (currentKeyYears < 6) {
    const additionalNeeded = 6 - currentKeyYears;
    let added = 0;

    for (let i = 0; i < timeline.length && added < additionalNeeded; i++) {
      const item = timeline[i];
      if (!item.isKeyYear) {
           // 选择波动较大的年份
           const change = Math.abs(item.close - item.open);
           if (change > 10) {
             item.isKeyYear = true;
             // 确保关键年有完整的yearlyReview结构
             if (!item.yearlyReview || typeof item.yearlyReview !== 'object') {
               item.yearlyReview = { brief: '', detailed: null };
             }
             if (!item.yearlyReview.brief) {
               item.yearlyReview.brief = `第${item.age}年关键转折`;
             }
             if (!item.yearlyReview.detailed) {
               item.yearlyReview.detailed = {
                 career: "事业发展顺利",
                 wealth: "财运平稳",
                 health: "注意身体健康",
                 advice: "保持积极心态"
               };
             }
             added++;
           }
      }
    }

     // 如果还不够，随机添加一些
     for (let i = 0; i < timeline.length && added < additionalNeeded; i++) {
       const item = timeline[i];
       if (!item.isKeyYear && !item.isPeak) {
         item.isKeyYear = true;
         // 确保关键年有完整的yearlyReview结构
         if (!item.yearlyReview || typeof item.yearlyReview !== 'object') {
           item.yearlyReview = { brief: '', detailed: null };
         }
         if (!item.yearlyReview.brief) {
           item.yearlyReview.brief = `第${item.age}年重要年份`;
         }
         if (!item.yearlyReview.detailed) {
           item.yearlyReview.detailed = {
             career: "事业发展",
             wealth: "财运平稳",
             health: "注意健康",
             advice: "积极向上"
           };
         }
         added++;
       }
     }
  }

  // 确保大运起始年是关键年
  const daYunStartYear = birthYear + startAge;
  timeline.forEach((item: any) => {
    if (item.year === daYunStartYear) {
      item.isKeyYear = true;
    }
  });

  return timeline;
}

function validateTimelineResult(data: any, birthYear: number, requireFullDetails: boolean = false): { valid: boolean; errors: string[] } {
  const errors = [];

  if (!data || typeof data !== 'object') {
    errors.push("数据格式错误：必须是JSON对象");
    return { valid: false, errors };
  }

  if (!data.timeline || !Array.isArray(data.timeline)) {
    errors.push("缺少timeline字段或格式不正确");
    return { valid: false, errors };
  }

  if (data.timeline.length !== 100) {
    errors.push(`Timeline必须有恰好100个条目，当前：${data.timeline.length}`);
    return { valid: false, errors };
  }

  const firstYear = data.timeline[0]?.year;
  if (firstYear !== birthYear) {
    errors.push(`第一个年份必须是出生年份${birthYear}，当前：${firstYear}`);
  }

  const lastYear = data.timeline[data.timeline.length - 1]?.year;
  if (lastYear !== birthYear + 99) {
    errors.push(`最后一个年份必须是${birthYear + 99}，当前：${lastYear}`);
  }

  // 在两阶段流程中，第一阶段不需要验证关键年份数量和详细点评
  if (requireFullDetails) {
    const keyYearsCount = data.timeline.filter((item: any) => item.isKeyYear).length;
    // 新的两阶段流程：5-7个关键年份（特殊年份）
    if (keyYearsCount < 5 || keyYearsCount > 7) {
      errors.push(`关键年份必须占5-7个，当前：${keyYearsCount}个`);
    }
  }

  let peakCount = 0;
  let hasValidPeak = false;

  for (let i = 0; i < data.timeline.length; i++) {
    const item = data.timeline[i];

    if (item.isPeak) {
      peakCount++;
      if (item.isKeyYear && item.age >= 20 && item.age <= 50) {
        hasValidPeak = true;
      }
    }

    // 只在完整验证模式下检查yearlyReview
    if (requireFullDetails && item.isKeyYear) {
      if (!item.yearlyReview) {
        errors.push(`年份${item.year}：关键年份必须包含yearlyReview`);
      } else if (!item.yearlyReview.detailed || (typeof item.yearlyReview.detailed === 'object' && Object.keys(item.yearlyReview.detailed).length === 0)) {
        // 尝试修复：添加默认的detailed信息
        if (!item.yearlyReview.detailed) {
          item.yearlyReview.detailed = {
            career: "事业发展",
            wealth: "财运平稳",
            health: "注意健康",
            advice: "积极向上"
          };
        }
      }
    }

    if (item.open < 0 || item.open > 100 ||
        item.close < 0 || item.close > 100 ||
        item.high < 0 || item.high > 100 ||
        item.low < 0 || item.low > 100) {
      errors.push(`年份${item.year}：K线数值必须在0-100之间`);
    }

    if (item.high < item.open || item.high < item.close) {
      errors.push(`年份${item.year}：high必须大于等于open和close`);
    }

    if (item.low > item.open || item.low > item.close) {
      errors.push(`年份${item.year}：low必须小于等于open和close`);
    }
  }

  if (peakCount !== 1) {
    errors.push(`必须有恰好1个人生巅峰（isPeak），当前：${peakCount}个`);
  }

  if (!hasValidPeak) {
    errors.push("人生巅峰必须在20-50岁之间");
  }

  return { valid: errors.length === 0, errors };
}

function validateDimensionResult(data: any, dimension: string): { valid: boolean; errors: string[] } {
  const errors = [];

  if (!data || typeof data !== 'object') {
    errors.push(`${dimension}：数据格式错误`);
    return { valid: false, errors };
  }

  if (typeof data.rating !== 'number' || data.rating < 1 || data.rating > 10) {
    errors.push(`${dimension}：rating必须是1-10的数字`);
  }

  if (!data.summary || typeof data.summary !== 'string' || data.summary.length < 30) {
    errors.push(`${dimension}：summary必须至少30字`);
  }

  if (!data.details || typeof data.details !== 'object') {
    errors.push(`${dimension}：必须包含details字段`);
  } else {
    if (!Array.isArray(data.details.strengths) || data.details.strengths.length < 3) {
      errors.push(`${dimension}：strengths必须至少3条`);
    }
    if (!Array.isArray(data.details.weaknesses) || data.details.weaknesses.length < 2) {
      errors.push(`${dimension}：weaknesses必须至少2条`);
    }
    if (!Array.isArray(data.details.recommendations) || data.details.recommendations.length < 4) {
      errors.push(`${dimension}：recommendations必须至少4条`);
    }
    if (!Array.isArray(data.details.taboos) || data.details.taboos.length < 2) {
      errors.push(`${dimension}：taboos必须至少2条`);
    }
  }

  return { valid: errors.length === 0, errors };
}

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
你是一个八字命理专家。根据以下八字信息生成命主属性和总述。

**优质示例：**

示例1：
输入：年柱甲子，月柱乙丑，日柱丙寅，时柱丁卯；大运：丙寅、丁卯、戊辰、己巳、庚午、辛未；起运岁数：3；命主属性：丙火（伤官格）；命主强弱：中和偏弱
输出：
{
  "mainAttribute": "中和火命（伤官格）",
  "generalComment": "日主丙火生于丑月，得甲乙木相生，根基尚可。性格聪慧灵动，创造力强，才华出众。伤官格代表思维敏捷，表达能力佳，但需注意言辞过于直接。一生起伏中蕴含机遇，中年后运势渐佳，宜从事创作、教育等发挥才智的职业。"
}

示例2：
输入：年柱壬申，月柱癸酉，日柱乙巳，时柱丙子；大运：甲戌、乙亥、丙子、丁丑、戊寅、己卯；起运岁数：5；命主属性：乙木（正财格）；命主强弱：身弱
输出：
{
  "mainAttribute": "弱木命（正财格）",
  "generalComment": "日主乙木生于酉月，金旺木弱，时干丙火虽有帮扶但力量有限。性格温和务实，善于理财，注重现实利益。正财格表明财运稳定，但不宜冒进。人生运势早年平平，中年后逢印运助身，事业财运同步提升，宜稳重经营，循序渐进。"
}

**现在请分析以下八字：**

**八字信息：**
- 八字四柱：${baziString}
- 大运：${daYunString}
- 起运岁数：${startAge}
- 命主属性：${dayElement}命（${dayMasterType}）
- 命主强弱：${strengthDescription}

返回 ONLY 符合以下 JSON 格式：
{
  "mainAttribute": "字符串 - 命主属性，如'弱火命'、'强金命'，格式为'强弱+五行命（格局）'",
  "generalComment": "字符串 - 命运总述，3-4句话，100-150字，包含性格、运势走向、职业建议"
}

重要要求：所有输出内容必须使用**简体中文**，不要出现英文。参考示例风格，总述要具体、有针对性，避免空泛。

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
  dayElement: string,
  keyYearsCount: number = 4
) => `
生成${birthYear}年到${birthYear + 99}年共100条K线数据。

基础信息：
出生${birthYear}年，起运${startAge}岁（${birthYear + startAge}年），${dayElement}命

每条数据格式：
year(年份),age(虚岁),open(开),high(高),low(低),close(收),summary(总结),isKeyYear(是否关键年),yearlyReview(年度评述)

要求：
1. 恰好100条，年份连续
2. K线值0-100，连续平滑
3. 关键年${keyYearsCount}个：${birthYear + startAge}年（大运开始）、巅峰年（20-50岁high最高）、波动年(|close-open|>30）
4. 关键年detailed有career/wealth/health/advice
5. 普通年detailed为null
6. 牛熊市混合

返回JSON：
{
  "timeline": [
    {"year":${birthYear},"age":1,"open":40,"close":42,"high":45,"low":38,"summary":"出生年父母呵护","isKeyYear":false,"yearlyReview":{"brief":"幼年平稳","detailed":null}},
    {"year":${birthYear + 1},"age":2,"open":42,"close":45,"high":48,"low":40,"summary":"渐入佳境","isKeyYear":false,"yearlyReview":{"brief":"稳步成长","detailed":null}},
    {"year":${birthYear + startAge},"age":${startAge + 1},"open":50,"close":55,"high":60,"low":48,"summary":"大运开始运势升","isKeyYear":true,"yearlyReview":{"brief":"大运交接年运势上升","detailed":{"career":"事业运大旺","wealth":"财运渐开","health":"身体强健","advice":"把握大运机遇"}}}
  ]
}

必须恰好100条！每条必须包含所有字段！只返回JSON，无其他内容。
`;

const createBatchPrompt = (
  lang: string,
  startYear: number,
  startAge: number,
  endYear: number,
  startYearIndex: number,
  dayElement: string
) => {
  const yearsCount = endYear - startYear + 1;

  if (lang === 'English') {
    return `
Generate ${yearsCount} years of K-line data from year ${startYear} to ${endYear} (K-line only, no detailed reviews).

Basic Information:
- Start year: ${startYear} (age ${startYearIndex})
- End year: ${endYear} (age ${startYearIndex + yearsCount - 1})
- Day element: ${dayElement}

Each data format:
year (year number), age (virtual age), open, high, low, close, summary (one sentence, within 20 words)

Requirements:
1. Exactly ${yearsCount} entries, continuous years
2. K-line values 0-100, follow K-line logic (high >= open/close, low <= open/close)
3. Summary brief (within 20 words)
4. Mix of bull and bear markets
5. Must have one peak between age 20-50 (high > 85)
6. Values should be natural and continuous, avoid sudden changes

Return JSON format:
{
  "timeline": [
    {"year":${startYear},"age":${startYearIndex},"open":40,"close":42,"high":45,"low":38,"summary":"Stable fortune"},
    {"year":${startYear + 1},"age":${startYearIndex + 1},"open":42,"close":45,"high":48,"low":40,"summary":"Steady progress"}
  ]
}

Must have exactly ${yearsCount} entries! Return JSON only, nothing else.
`;
  }

  return `
生成${yearsCount}条K线数据，从${startYear}年到${endYear}年（仅K线，无详细点评）。

基础信息：
- 起始年份：${startYear}（${startYearIndex}岁）
- 结束年份：${endYear}（${startYearIndex + yearsCount - 1}岁）
- 日主：${dayElement}命

每条数据格式：
year(年份), age(虚岁), open(开), high(高), low(低), close(收), summary(一句话，20字内)

要求：
1. 恰好${yearsCount}条，年份连续
2. K线值0-100，符合K线逻辑（high >= open/close, low <= open/close）
3. summary简短（20字内）
4. 牛熊市混合
5. 20-50岁间必有一个巅峰（high > 85）
6. 数值自然连续，避免突变

返回JSON格式：
{
  "timeline": [
    {"year":${startYear},"age":${startYearIndex},"open":40,"close":42,"high":45,"low":38,"summary":"运势平稳"},
    {"year":${startYear + 1},"age":${startYearIndex + 1},"open":42,"close":45,"high":48,"low":40,"summary":"稳步前进"}
  ]
}

必须恰好${yearsCount}条！只返回JSON，无其他内容。
`;
};

// ------------------------------------------------------------------
// API 连接测试
// ------------------------------------------------------------------

/**
 * 测试AI API连接
 */
export async function testAIConnection(): Promise<{ success: boolean; message: string; error?: any }> {
  try {
    console.log('🧪 测试AI API连接...');

    // 检测是否使用推理模型
    const isReasoner = finalModel.includes('reasoner');
    const testMaxTokens = isReasoner ? 4000 : 500; // 推理模型需要更多tokens

    console.log(`📊 模型类型: ${isReasoner ? '深度推理模型' : '普通模型'}, max_tokens: ${testMaxTokens}`);

    const testPrompt = `请返回一个简单的JSON对象：{"status": "ok", "message": "连接成功"}。只返回JSON，无其他内容。`;
    const messages = [{ role: "user", content: testPrompt }];

    const response = await client.chat.completions.create({
      model: finalModel,
      messages: messages,
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: testMaxTokens,
    });

    console.log(`📥 测试响应: finish_reason=${response.choices[0]?.finish_reason}, tokens=${response.usage?.total_tokens}`);

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return {
        success: false,
        message: 'API返回空响应',
        error: { finishReason: response.choices[0]?.finish_reason, usage: response.usage }
      };
    }

    const parsed = JSON.parse(content);
    console.log('✅ API连接测试成功:', parsed);

    return { success: true, message: 'API连接正常' };
  } catch (error: any) {
    console.error('❌ API连接测试失败:', error);
    return {
      success: false,
      message: 'API连接失败',
      error: error.message || error
    };
  }
}

// ------------------------------------------------------------------
// API 调用函数
// ------------------------------------------------------------------

/**
 * 调用 AI 模型生成 JSON 响应
 */
async function callAI(prompt: string, systemPrompt?: string, temperature: number = 0.7, maxTokens: number = 16000): Promise<any> {
  try {
    const messages: any[] = [
      { role: "user", content: prompt }
    ];

    if (systemPrompt) {
      messages.unshift({ role: "system", content: systemPrompt });
    }

    console.log(`📤 发送AI请求，prompt长度: ${prompt.length}, 模型: ${finalModel}`);

    const response = await client.chat.completions.create({
      model: finalModel,
      messages: messages,
      response_format: { type: "json_object" },
      temperature: temperature,
      max_tokens: maxTokens,
    });

    console.log(`📥 收到AI响应，choices数量: ${response.choices.length}`);
    console.log(`📊 Token使用: ${response.usage?.total_tokens || 'N/A'} (prompt: ${response.usage?.prompt_tokens || 'N/A'}, completion: ${response.usage?.completion_tokens || 'N/A'})`);

    const choice = response.choices[0];
    console.log(`🔍 Finish reason: ${choice?.finish_reason}`);

    // 特殊处理推理模型的reasoning tokens
    if (response.usage?.completion_tokens_details?.reasoning_tokens) {
      console.log(`🧠 推理Tokens: ${response.usage.completion_tokens_details.reasoning_tokens}`);
    }

    const content = choice?.message?.content;
    if (!content) {
      // 如果finish_reason是length，说明max_tokens不够
      if (choice?.finish_reason === 'length') {
        const errorMsg = isReasonerModel
          ? `响应被截断（深度推理模型需要更多tokens）。已用: ${response.usage?.completion_tokens}/${maxTokens}，建议增加max_tokens至少到${maxTokens * 2}`
          : `响应被截断（max_tokens不足）。已用: ${response.usage?.completion_tokens}/${maxTokens}`;
        console.error('❌ ' + errorMsg);
        throw new Error(errorMsg);
      }

      console.error('❌ AI响应结构异常:', {
        hasChoices: response.choices.length > 0,
        choice,
        finishReason: choice?.finish_reason,
        usage: response.usage,
        rawResponse: JSON.stringify(response, null, 2)
      });
      throw new Error("AI 返回空响应");
    }

    // 检查响应是否被截断
    const trimmedContent = content.trim();
    if (!trimmedContent.endsWith('}')) {
      console.warn(`⚠️ AI响应可能被截断，长度: ${trimmedContent.length}, 结尾: "${trimmedContent.slice(-50)}"`);
      throw new Error(`JSON被截断，当前长度: ${trimmedContent.length}`);
    }

    const parsed = JSON.parse(trimmedContent);
    console.log(`✅ JSON解析成功，总长度: ${trimmedContent.length}`);
    return parsed;
  } catch (error: any) {
    console.error("AI API Error:", error);

    // 检查是否为配额耗尽错误
    if (isQuotaExhaustedError(error)) {
      throw new Error("QUOTA_EXHAUSTED");
    }

    // JSON解析错误 - 可能是响应被截断
    if (error.message.includes('JSON') || error.message.includes('Unterminated')) {
      console.error('❌ JSON解析失败，响应可能被截断');
      throw new Error(`JSON解析失败: ${error.message}`);
    }

    throw error;
  }
}

/**
 * 带重试的AI调用
 * @param prompt - 提示词
 * @param description - 用于日志和进度描述
 * @param maxRetries - 最大重试次数（默认3）
 * @param temperature - 温度参数（默认0.7）
 * @param progressCallback - 进度回调（可选）
 * @param progressValue - 当前进度值（可选）
 * @param progressText - 进度文本（可选）
 * @param maxTokens - 最大token数（默认16000）
 * @param fallbackFn - 降级函数（可选）
 */
async function callAIWithRetry(
  prompt: string,
  description: string,
  maxRetries: number = 3,
  temperature: number = 0.7,
  progressCallback?: ProgressCallback,
  progressValue?: number,
  progressText?: string,
  maxTokens: number = 16000,
  fallbackFn?: () => Promise<any>
): Promise<any> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🤖 AI调用 [${description}] - 尝试 ${attempt}/${maxRetries} (temperature: ${temperature}, max_tokens: ${maxTokens})`);

      const result = await callAI(prompt, undefined, temperature, maxTokens);

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

      // 如果是最后一次尝试，启用降级方案
      if (attempt === maxRetries) {
        console.warn(`⚠️ [${description}] 达到最大重试次数，尝试降级方案...`);

        // 降级方案1：降低keyYearsCount并重试（仅针对timeline生成）
        if (description === '人生K线生成') {
          try {
            console.log(`🔄 降级：减少详细年份数量，重试一次...`);
            const fallbackPrompt = prompt.replace(/关键年份必须恰好\d+个/g, `关键年份必须恰好2个`);
            return await callAI(fallbackPrompt, undefined, temperature, maxTokens);
          } catch (fallbackError: any) {
            console.error('❌ 降级方案1也失败了', fallbackError.message);
            // 如果降级方案1也失败，尝试降级方案2
          }
        }

        // 降级方案2：使用降级函数
        if (fallbackFn) {
          console.warn('⚠️ 降级方案2：使用本地生成...');
          try {
            return await fallbackFn();
          } catch (fallbackError: any) {
            console.error('❌ 降级方案2也失败了', fallbackError.message);
          }
        }

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

/**
 * 降级方案：生成简化的timeline数据
 */
function generateFallbackTimeline(birthYear: number, startAge: number): any {
  const timeline = [];

  for (let i = 0; i < 100; i++) {
    const year = birthYear + i;
    const age = i + 1;
    const isDaYunStart = (year === birthYear + startAge);
    const isPeak = (age >= 25 && age <= 35 && i > 10);

    let open = 40 + Math.random() * 20;
    let close = open + (Math.random() - 0.5) * 20;
    let high = Math.max(open, close) + Math.random() * 10;
    let low = Math.min(open, close) - Math.random() * 10;

    open = Math.max(10, Math.min(90, open));
    close = Math.max(10, Math.min(90, close));
    high = Math.max(10, Math.min(95, high));
    low = Math.max(5, Math.min(90, low));

    const item: any = {
      year,
      age,
      open: Math.round(open),
      close: Math.round(close),
      high: Math.round(high),
      low: Math.round(low),
      summary: `${year}年运势${close > open ? '上升' : '平稳'}，继续努力前行。`,
      isKeyYear: isDaYunStart || (isPeak && i % 20 === 0),
      yearlyReview: {
        brief: `${year}年${age}岁，${close > open ? '运势较好' : '平稳发展'}，保持积极心态。`,
        detailed: (isDaYunStart || (isPeak && i % 20 === 0)) ? {
          career: "事业稳步发展，保持努力",
          wealth: "财运平稳，注意理财",
          health: "注意身体健康",
          advice: "保持乐观心态"
        } : null
      }
    };

    if (isPeak && !timeline.some((t: any) => t.isPeak)) {
      item.isPeak = true;
      item.summary = `${year}年人生巅峰，事业财运双丰收`;
      if (item.yearlyReview.detailed) {
        item.yearlyReview.brief = `${year}年人生巅峰，达到事业和财富的高峰`;
        item.yearlyReview.detailed.career = "事业达到巅峰期，升职加薪或创业成功";
        item.yearlyReview.detailed.wealth = "财运爆发，收入大幅增长";
        item.yearlyReview.detailed.health = "身体状态良好，注意劳逸结合";
        item.yearlyReview.detailed.advice = "把握巅峰期，大胆前进";
      }
    } else {
      item.isPeak = false;
    }

    timeline.push(item);
  }

  return { timeline };
}

export const generateDestinyAnalysis = async (
  confirmedBaZi: BaZiResult,
  lang: Language = 'zh',
  progressCallback?: ProgressCallback,
  config?: AnalysisConfig
): Promise<AnalysisResult> => {
  const langInstruction = lang === 'zh' ? '简体中文' : 'English';

  const keyYearsCount = config?.keyYearsCount || 7;
  const maxRetries = config?.maxRetries || 3;
  const enableFallback = config?.enableFallback !== false;

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
  // 执行本地命理分析（模拟AI生成效果，添加延迟和渐进显示）
  // -----------------------------------------------------------------------
  let basicAnalysis: BasicAnalysisResult;
  let extendedAnalysis: ExtendedAnalysisResult;
  let personalityAnalysis: any;

  // 辅助函数：模拟 AI 生成延迟
  const simulateAIDelay = (minMs: number, maxMs: number) => {
    const delay = minMs + Math.random() * (maxMs - minMs);
    return new Promise(resolve => setTimeout(resolve, delay));
  };

  console.log('🔍 开始本地基础命理分析...');
  if (progressCallback) {
    progressCallback(10, getProgressText('step1'), 20);
  }

  // 添加3-4秒延迟，模拟AI深度思考
  await simulateAIDelay(3000, 4000);

  basicAnalysis = analyzeBasicBaZi(
    confirmedBaZi.userInput.birthDate,
    confirmedBaZi.userInput.birthTime,
    confirmedBaZi.userInput.birthLocation
  );
  console.log('✅ 基础分析完成');

  // 添加0.5-1秒延迟后再返回结果
  await simulateAIDelay(500, 1000);

  if (progressCallback) {
    const partialResult: PartialAnalysisResult = {
      basicAnalysis: basicAnalysis
    };
    progressCallback(15, getProgressText('step1'), 18, partialResult);
  }

  console.log('🔍 开始本地扩展命理分析...');
  if (progressCallback) {
    progressCallback(18, getProgressText('step2'), 18);
  }

  // 添加3-4秒延迟
  await simulateAIDelay(3000, 4000);

  extendedAnalysis = generateExtendedAnalysis(basicAnalysis, confirmedBaZi.userInput);
  console.log('✅ 扩展分析完成');

  // 添加0.5-1秒延迟后再返回结果
  await simulateAIDelay(500, 1000);

  if (progressCallback) {
    const partialResult: PartialAnalysisResult = {
      basicAnalysis: basicAnalysis,
      extendedAnalysis: extendedAnalysis
    };
    progressCallback(25, getProgressText('step2'), 15, partialResult);
  }

  console.log('🔍 生成本地性格分析...');
  if (progressCallback) {
    progressCallback(28, getProgressText('step3'), 17);
  }

  // 添加2-3秒延迟
  await simulateAIDelay(2000, 3000);

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
      3,
      0.5
    );
    console.log('✅ AI调用1完成');
    if (progressCallback) {
      const partialResult: PartialAnalysisResult = {
        mainAttribute: mainResult.mainAttribute,
        generalComment: mainResult.generalComment
      };
      progressCallback(40, getProgressText('step4'), 12, partialResult);
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
      3,
      0.5
    );
    console.log('✅ AI调用2完成');
    if (progressCallback) {
      const partialResult: PartialAnalysisResult = {
        geographicDevelopment: geographicResult
      };
      progressCallback(50, getProgressText('step5'), 10, partialResult);
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
      3,
      0.6
    );
    const personalityValidation = validateDimensionResult(personalityResult, '性格');
    if (!personalityValidation.valid) {
      console.warn('⚠️ 性格分析验证警告：', personalityValidation.errors);
    } else {
      console.log('✅ 性格分析验证通过');
    }
    console.log('✅ AI调用3完成');
    if (progressCallback) {
      const partialResult: PartialAnalysisResult = {
        personality: personalityResult
      };
      progressCallback(60, getProgressText('step6'), 8, partialResult);
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
      3,
      0.7
    );
    const careerValidation = validateDimensionResult(careerResult, '事业');
    if (!careerValidation.valid) {
      console.warn('⚠️ 事业分析验证警告：', careerValidation.errors);
    } else {
      console.log('✅ 事业分析验证通过');
    }
    console.log('✅ AI调用4完成');
    if (progressCallback) {
      const partialResult: PartialAnalysisResult = {
        career: careerResult
      };
      progressCallback(70, getProgressText('step7'), 6, partialResult);
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
      3,
      0.5
    );
    const fengShuiValidation = validateDimensionResult(fengShuiResult, '风水');
    if (!fengShuiValidation.valid) {
      console.warn('⚠️ 风水分析验证警告：', fengShuiValidation.errors);
    } else {
      console.log('✅ 风水分析验证通过');
    }
    console.log('✅ AI调用5完成');
    if (progressCallback) {
      const partialResult: PartialAnalysisResult = {
        fengShui: fengShuiResult
      };
      progressCallback(80, getProgressText('step8'), 5, partialResult);
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
      3,
      0.7
    );
    const wealthValidation = validateDimensionResult(wealthResult, '财富');
    if (!wealthValidation.valid) {
      console.warn('⚠️ 财富分析验证警告：', wealthValidation.errors);
    } else {
      console.log('✅ 财富分析验证通过');
    }
    console.log('✅ AI调用6完成');
    if (progressCallback) {
      const partialResult: PartialAnalysisResult = {
        wealth: wealthResult
      };
      progressCallback(90, getProgressText('step9'), 3, partialResult);
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
      3,
      0.7
    );
    const marriageValidation = validateDimensionResult(marriageResult, '婚姻');
    if (!marriageValidation.valid) {
      console.warn('⚠️ 婚姻分析验证警告：', marriageValidation.errors);
    } else {
      console.log('✅ 婚姻分析验证通过');
    }
    console.log('✅ AI调用7完成');
    if (progressCallback) {
      const partialResult: PartialAnalysisResult = {
        marriage: marriageResult
      };
      progressCallback(95, getProgressText('step10'), 2, partialResult);
    }

    // AI调用8-9: 100年Timeline分段生成 (95-100%)
    console.log('🤖 AI调用8-9: 100年Timeline分段生成（2批）');
    if (progressCallback) {
      progressCallback(95, getProgressText('step11'), 20);
    }

    // 分成2批：第1-50年和第51-100年
    const midYear = birthYear + 49;

    // 批次1：第1-50年（仅K线数据，无详细点评）
    console.log('🤖 AI调用8a: 生成第1-50年K线数据');
    if (progressCallback) {
      progressCallback(97, getProgressText('step11'), 8);
    }

    let batch1Result: any;
    try {
      const batch1MaxTokens = getAdjustedMaxTokens(8000);
      console.log(`📊 批次1 max_tokens: ${batch1MaxTokens} (基础: 8000, 推理模型: ${isReasonerModel})`);

      batch1Result = await callAIWithRetry(
        createBatchPrompt(langInstruction, birthYear, confirmedBaZi.startAge, midYear, 1, basicAnalysis.dayElement),
        'K线数据生成（批次1）',
        maxRetries,
        0.8,
        progressCallback,
        97,
        getProgressText('step11'),
        batch1MaxTokens
      );
      console.log('✅ AI调用8a完成');
    } catch (error: any) {
      console.error('❌ 批次1生成失败，使用本地生成');
      console.log('🔄 降级：使用本地生成完整timeline...');
      batch1Result = { timeline: generateFallbackTimeline(birthYear, confirmedBaZi.startAge).timeline.slice(0, 50) };
    }

    // 批次2：第51-100年（仅K线数据，无详细点评）
    console.log('🤖 AI调用8b: 生成第51-100年K线数据');
    if (progressCallback) {
      progressCallback(98, getProgressText('step11'), 8);
    }

    let batch2Result: any;
    try {
      const batch2MaxTokens = getAdjustedMaxTokens(8000);
      console.log(`📊 批次2 max_tokens: ${batch2MaxTokens} (基础: 8000, 推理模型: ${isReasonerModel})`);

      batch2Result = await callAIWithRetry(
        createBatchPrompt(langInstruction, midYear + 1, confirmedBaZi.startAge, birthYear + 99, 51, basicAnalysis.dayElement),
        'K线数据生成（批次2）',
        maxRetries,
        0.8,
        progressCallback,
        98,
        getProgressText('step11'),
        batch2MaxTokens
      );
      console.log('✅ AI调用8b完成');
    } catch (error: any) {
      console.error('❌ 批次2生成失败，使用本地生成');
      console.log('🔄 降级：使用本地生成完整timeline...');
      batch2Result = { timeline: generateFallbackTimeline(birthYear, confirmedBaZi.startAge).timeline.slice(50) };
    }

    // 合并两批数据
    console.log('🔗 合并两批数据...');
    const mergedTimeline = [
      ...batch1Result.timeline,
      ...batch2Result.timeline
    ];

    timelineResult = { timeline: mergedTimeline };
    console.log('✅ Timeline合并完成，总条目:', mergedTimeline.length);

    // 数据标准化：修复K线关系，确保验证通过
    console.log('🔧 标准化Timeline数据...');
    timelineResult.timeline = normalizeTimelineData(timelineResult.timeline, birthYear, confirmedBaZi.startAge);
    console.log('✅ Timeline标准化完成');

    // -----------------------------------------------------------------------
    // 数据清洗：标记人生巅峰和关键年份（在验证之前）
    // -----------------------------------------------------------------------
    console.log('🔍 标记人生巅峰和关键年份...');
    let maxHigh = -Infinity;
    let maxClose = -Infinity;
    let peakIdx = -1;

    if (timelineResult.timeline && Array.isArray(timelineResult.timeline)) {
      timelineResult.timeline.forEach((item: any, idx: number) => {
        // 找出人生巅峰（最高的high值，且在20-50岁之间）
        if (item.age >= 20 && item.age <= 50) {
          if (item.high > maxHigh) {
            maxHigh = item.high;
            maxClose = item.close;
            peakIdx = idx;
          } else if (item.high === maxHigh && item.close > maxClose) {
            maxClose = item.close;
            peakIdx = idx;
          }
        }
      });

      // 重置所有标记
      timelineResult.timeline.forEach((item: any) => {
        item.isPeak = false;
        item.isKeyYear = false;
      });

      // 设置唯一巅峰
      if (peakIdx !== -1 && timelineResult.timeline[peakIdx]) {
        timelineResult.timeline[peakIdx].isPeak = true;
        timelineResult.timeline[peakIdx].isKeyYear = true;
        console.log(`✅ 人生巅峰：${timelineResult.timeline[peakIdx].year}年（${timelineResult.timeline[peakIdx].age}岁，high=${timelineResult.timeline[peakIdx].high}）`);
      }
    }

    // 验证Timeline数据（第一阶段：不要求详细点评）
    const timelineValidation = validateTimelineResult(timelineResult, birthYear, false);
    if (!timelineValidation.valid) {
      console.error('❌ Timeline验证失败：', timelineValidation.errors);
      throw new Error(`Timeline数据验证失败：${timelineValidation.errors.join(', ')}`);
    } else {
      console.log('✅ Timeline验证通过');
    }

    // 🎉 本地增强：为每年份添加丰富的补充信息
    console.log('🎨 本地增强Timeline数据...');
    timelineResult.timeline = enhanceTimeline(
      timelineResult.timeline,
      confirmedBaZi.bazi,
      confirmedBaZi.startAge,
      lang
    );
    console.log('✅ Timeline增强完成 - 每年包含趋势/阶段/评级等信息');

    // -----------------------------------------------------------------------
    // 选择特殊年份并生成详细点评 (新增)
    // -----------------------------------------------------------------------
    console.log('🎯 智能选择特殊年份...');
    const specialYears = selectSpecialYears(
      timelineResult.timeline,
      birthYear,
      confirmedBaZi.startAge,
      lang
    );
    console.log(`✅ 选中${specialYears.length}个特殊年份`);

    // AI生成详细点评
    console.log('🤖 AI调用9: 生成特殊年份详细点评...');
    if (progressCallback) {
      progressCallback(99, getProgressText('step11'), 5);
    }

    let detailedReviews: any;
    try {
      const detailPrompt = createDetailedReviewPrompt(specialYears, lang);
      const detailMaxTokens = getAdjustedMaxTokens(8000);
      console.log(`📊 详细点评 max_tokens: ${detailMaxTokens} (基础: 8000, 推理模型: ${isReasonerModel})`);

      detailedReviews = await callAIWithRetry(
        detailPrompt,
        '特殊年份详细点评',
        2,
        0.7,
        undefined,
        undefined,
        undefined,
        detailMaxTokens
      );
      console.log('✅ AI调用9完成 - 详细点评生成完毕');
    } catch (error: any) {
      console.error('❌ 详细点评生成失败，使用简化版本');
      detailedReviews = { reviews: [] };
    }

    // 将详细点评合并到timeline
    console.log('🔗 合并详细点评到Timeline...');
    if (detailedReviews.reviews && Array.isArray(detailedReviews.reviews)) {
      detailedReviews.reviews.forEach((review: any) => {
        const yearData = timelineResult.timeline.find((t: any) => t.year === review.year);
        if (yearData) {
          yearData.isKeyYear = true;
          yearData.yearlyReview = {
            brief: yearData.summary,
            detailed: {
              career: review.career || '',
              wealth: review.wealth || '',
              health: review.health || '',
              advice: review.advice || ''
            }
          };
        }
      });
      console.log(`✅ 成功合并${detailedReviews.reviews.length}个年份的详细点评`);
    }

    // 最终验证：确保所有数据完整
    console.log('🔍 最终验证Timeline数据...');
    const finalValidation = validateTimelineResult(timelineResult, birthYear, true);
    if (!finalValidation.valid) {
      console.warn('⚠️ Timeline最终验证警告：', finalValidation.errors);
      // 警告但不中断流程，因为关键年份数量可能不足6-8个
    } else {
      console.log('✅ Timeline最终验证通过');
    }

    if (progressCallback) {
      const partialResult: PartialAnalysisResult = {
        timeline: timelineResult.timeline,
        volatilityAnalysis: `基于${basicAnalysis.dayElement}命（${basicAnalysis.shiShenAnalysis.dayMasterType}）和${basicAnalysis.strengthAnalysis.strengthDescription}的综合分析，结合${extendedAnalysis.fengShuiAdvice.favorableElements.join('、')}等喜用五行的运势起伏规律。重点分析了${specialYears.length}个特殊年份（包括人生巅峰、运势转折、大运开始等关键节点）。`
      };
      progressCallback(100, getProgressText('step11'), 0, partialResult);
    }

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
