/**
 * K线数据增强工具
 * 为每年份快速生成补充信息，不依赖AI
 */

import { BaZiChart } from '../types';

/**
 * 年龄阶段
 */
export type LifeStage = 'child' | 'teen' | 'youth' | 'adult' | 'middle' | 'senior';

/**
 * 运势趋势
 */
export type TrendType = 'rising' | 'falling' | 'stable' | 'volatile';

/**
 * 运势强度
 */
export type StrengthLevel = 'excellent' | 'good' | 'average' | 'weak' | 'poor';

/**
 * 增强后的年份信息
 */
export interface EnhancedYearInfo {
  trend: TrendType;
  trendIcon: string;
  trendLabel: string;
  stage: LifeStage;
  stageLabel: string;
  stageColor: string;
  strength: StrengthLevel;
  strengthIcon: string;
  strengthLabel: string;
  starRating: number; // 1-5星
  luckLevel: string; // 运势等级描述
  daYunPillar?: string; // 大运柱（如果该年是大运开始年）
  yearElement?: string; // 年份五行
  yearZodiac?: string; // 生肖
  isDaYunStart: boolean; // 是否大运开始年
  isPivotYear: boolean; // 是否转折年
  changePercent: number; // 涨跌幅百分比
}

/**
 * 获取年龄阶段
 */
function getLifeStage(age: number): LifeStage {
  if (age < 13) return 'child';
  if (age < 18) return 'teen';
  if (age < 30) return 'youth';
  if (age < 45) return 'adult';
  if (age < 60) return 'middle';
  return 'senior';
}

/**
 * 获取年龄阶段标签
 */
function getStageLabel(stage: LifeStage, lang: 'zh' | 'en'): string {
  const labels: Record<LifeStage, { zh: string; en: string }> = {
    child: { zh: '童年期', en: 'Childhood' },
    teen: { zh: '青春期', en: 'Teenager' },
    youth: { zh: '青年期', en: 'Youth' },
    adult: { zh: '壮年期', en: 'Adult' },
    middle: { zh: '中年期', en: 'Middle Age' },
    senior: { zh: '老年期', en: 'Senior' }
  };
  return labels[stage][lang];
}

/**
 * 获取年龄阶段颜色
 */
function getStageColor(stage: LifeStage): string {
  const colors: Record<LifeStage, string> = {
    child: 'bg-pink-100 text-pink-700 border-pink-200',
    teen: 'bg-purple-100 text-purple-700 border-purple-200',
    youth: 'bg-blue-100 text-blue-700 border-blue-200',
    adult: 'bg-green-100 text-green-700 border-green-200',
    middle: 'bg-amber-100 text-amber-700 border-amber-200',
    senior: 'bg-gray-100 text-gray-700 border-gray-200'
  };
  return colors[stage];
}

/**
 * 获取趋势类型
 */
function getTrend(open: number, close: number, high: number, low: number): TrendType {
  const change = close - open;
  const volatility = high - low;

  if (volatility > 20) return 'volatile';
  if (Math.abs(change) <= 3) return 'stable';
  return change > 0 ? 'rising' : 'falling';
}

/**
 * 获取趋势标签
 */
function getTrendLabel(trend: TrendType, lang: 'zh' | 'en'): string {
  const labels: Record<TrendType, { zh: string; en: string }> = {
    rising: { zh: '上升', en: 'Rising' },
    falling: { zh: '下降', en: 'Falling' },
    stable: { zh: '平稳', en: 'Stable' },
    volatile: { zh: '波动', en: 'Volatile' }
  };
  return labels[trend][lang];
}

/**
 * 获取趋势图标
 */
function getTrendIcon(trend: TrendType): string {
  const icons: Record<TrendType, string> = {
    rising: '📈',
    falling: '📉',
    stable: '➡️',
    volatile: '🌊'
  };
  return icons[trend];
}

/**
 * 获取运势强度
 */
function getStrength(close: number): StrengthLevel {
  if (close >= 80) return 'excellent';
  if (close >= 65) return 'good';
  if (close >= 45) return 'average';
  if (close >= 30) return 'weak';
  return 'poor';
}

/**
 * 获取强度图标
 */
function getStrengthIcon(strength: StrengthLevel): string {
  const icons: Record<StrengthLevel, string> = {
    excellent: '⭐⭐⭐⭐⭐',
    good: '⭐⭐⭐⭐',
    average: '⭐⭐⭐',
    weak: '⭐⭐',
    poor: '⭐'
  };
  return icons[strength];
}

/**
 * 获取强度标签
 */
function getStrengthLabel(strength: StrengthLevel, lang: 'zh' | 'en'): string {
  const labels: Record<StrengthLevel, { zh: string; en: string }> = {
    excellent: { zh: '极佳', en: 'Excellent' },
    good: { zh: '良好', en: 'Good' },
    average: { zh: '一般', en: 'Average' },
    weak: { zh: '偏弱', en: 'Weak' },
    poor: { zh: '较差', en: 'Poor' }
  };
  return labels[strength][lang];
}

/**
 * 获取运势等级描述
 */
function getLuckLevel(close: number, lang: 'zh' | 'en'): string {
  if (close >= 90) return lang === 'zh' ? '运势鼎盛' : 'Excellent Fortune';
  if (close >= 75) return lang === 'zh' ? '运势亨通' : 'Great Fortune';
  if (close >= 60) return lang === 'zh' ? '运势平稳' : 'Stable Fortune';
  if (close >= 45) return lang === 'zh' ? '运势一般' : 'Average Fortune';
  if (close >= 30) return lang === 'zh' ? '运势低迷' : 'Low Fortune';
  return lang === 'zh' ? '运势困顿' : 'Poor Fortune';
}

/**
 * 获取星级评分
 */
function getStarRating(close: number): number {
  if (close >= 90) return 5;
  if (close >= 75) return 4;
  if (close >= 60) return 3;
  if (close >= 40) return 2;
  return 1;
}

/**
 * 获取年份天干
 */
function getYearStem(year: number): string {
  const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  return stems[(year - 4) % 10];
}

/**
 * 获取年份地支
 */
function getYearBranch(year: number): string {
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  return branches[(year - 4) % 12];
}

/**
 * 获取年份五行
 */
function getYearElement(year: number): string {
  const stem = getYearStem(year);
  const elements: Record<string, string> = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水'
  };
  return elements[stem];
}

/**
 * 获取生肖
 */
function getYearZodiac(year: number): string {
  const zodiacs = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  return zodiacs[(year - 4) % 12];
}

/**
 * 获取大运柱
 */
function getDaYunPillar(age: number, startAge: number, bazi: BaZiChart): string | undefined {
  // 如果未到大运开始年龄
  if (age < startAge) return undefined;

  // 计算当前是第几步大运
  const daYunIndex = Math.floor((age - startAge) / 10);

  // 获取大运干支
  const daYunList = [
    { gan: bazi.month.gan, zhi: bazi.month.zhi },
  ];

  // 简化处理：这里可以根据大运推算规则计算
  // 实际应用中需要完整的大运推算逻辑
  return undefined; // 暂时返回undefined，可后续补充
}

/**
 * 主函数：增强年份信息
 */
export function enhanceYearInfo(
  year: number,
  age: number,
  open: number,
  close: number,
  high: number,
  low: number,
  bazi: BaZiChart,
  startAge: number,
  lang: 'zh' | 'en' = 'zh'
): EnhancedYearInfo {
  const stage = getLifeStage(age);
  const trend = getTrend(open, close, high, low);
  const strength = getStrength(close);
  const changePercent = ((close - open) / (open || 1)) * 100;

  // 检查是否是大运开始年
  const isDaYunStart = (age - startAge) % 10 === 0 && age >= startAge;

  // 检查是否是转折年（趋势变化）
  const isPivotYear = Math.abs(changePercent) > 15;

  return {
    trend,
    trendIcon: getTrendIcon(trend),
    trendLabel: getTrendLabel(trend, lang),
    stage,
    stageLabel: getStageLabel(stage, lang),
    stageColor: getStageColor(stage),
    strength,
    strengthIcon: getStrengthIcon(strength),
    strengthLabel: getStrengthLabel(strength, lang),
    starRating: getStarRating(close),
    luckLevel: getLuckLevel(close, lang),
    daYunPillar: getDaYunPillar(age, startAge, bazi),
    yearElement: getYearElement(year),
    yearZodiac: getYearZodiac(year),
    isDaYunStart,
    isPivotYear,
    changePercent: Math.round(changePercent * 10) / 10
  };
}

/**
 * 批量增强timeline数据
 */
export function enhanceTimeline(
  timeline: any[],
  bazi: BaZiChart,
  startAge: number,
  lang: 'zh' | 'en' = 'zh'
): any[] {
  return timeline.map((yearData) => ({
    ...yearData,
    enhanced: enhanceYearInfo(
      yearData.year,
      yearData.age,
      yearData.open,
      yearData.close,
      yearData.high,
      yearData.low,
      bazi,
      startAge,
      lang
    )
  }));
}
