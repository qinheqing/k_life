import { BasicAnalysisResult } from './basicAnalysis';
import { UserInput } from '../types';
import { analyzeGeographicDirection } from './geographicAnalysis';

export interface ExtendedAnalysisResult {
  // 事业分析
  careerAnalysis: {
    recommendedSectors: string[];
    suitableJobs: string[];
    careerScore: number; //1-10
    careerDetail: string;
    workStyle: string;
    leadershipPotential: number; //1-10
    entrepreneurshipPotential: number; //1-10
    teamworkAbility: number; //1-10
  };
  
  // 财富分析
  wealthAnalysis: {
    wealthLevel: number; //1-10
    earningAbility: number; //1-10
    investmentTalent: number; //1-10
    savingHabits: number; //1-10
    wealthDetail: string;
    moneyAttitude: string;
    wealthTiming: string; // 财运转好的时机
  };
  
  // 婚姻分析
  marriageAnalysis: {
    marriageAge: string; // 适合结婚的年龄
    spouseCharacteristics: string;
    marriageType: string;
    marriageScore: number; //1-10
    divorceRisk: number; //1-10 (数字越小越安全)
    compatibility: {
      withElement: Record<string, number>; // 与各五行的兼容性
      withShengXiao: Record<string, number>; // 与各生肖的兼容性
    };
    marriageDetail: string;
    spouseStar: string; // 配偶星
  };
  
  // 风水建议
  fengShuiAdvice: {
    favorableColors: string[];
    unfavorableColors: string[];
    favorableDirections: string[];
    unfavorableDirections: string[];
    favorableElements: string[];
    unfavorableElements: string[];
    luckyNumbers: number[];
    unluckyNumbers: number[];
    fengShuiDetail: string;
    homeArrangement: string;
    workplaceArrangement: string;
  };
  
  // 健康分析
  healthAnalysis: {
    healthLevel: number; //1-10
    susceptibleDiseases: string[];
    healthTips: string[];
    exerciseRecommendation: string;
    dietRecommendation: string;
    healthDetail: string;
  };
  
  // 教育学习
  educationAnalysis: {
    learningAbility: number; //1-10
    bestSubjects: string[];
    suitableEducationFields: string[];
    studyMethod: string;
    educationDetail: string;
  };
  
  // 地理分析
  geographicAnalysis: {
    favorableProvinces: string[];
    favorableCities: string[];
    unfavorableRegions: string[];
    careerMatch: Record<string, number>;
  };
}

/**
 * 扩展分析 - 事业、财富、婚姻、风水等
 */
export function generateExtendedAnalysis(
  basicAnalysis: BasicAnalysisResult,
  userInput: UserInput
): ExtendedAnalysisResult {
  const { shiShenAnalysis, dayElement, strengthAnalysis } = basicAnalysis;
  
  // 事业分析
  const careerAnalysis = analyzeCareer(shiShenAnalysis.dayMasterType, dayElement, strengthAnalysis.isStrong);
  
  // 财富分析  
  const wealthAnalysis = analyzeWealth(shiShenAnalysis.dayMasterType, strengthAnalysis.strengthLevel, dayElement);
  
  // 婚姻分析
  const marriageAnalysis = analyzeMarriage(userInput.gender, shiShenAnalysis.dayMasterType, basicAnalysis.basicAnalysis.shengXiao.day);
  
  // 风水建议
  const fengShuiAdvice = analyzeFengShui(dayElement, shiShenAnalysis.dayMasterType);
  
  // 健康分析
  const healthAnalysis = analyzeHealth(dayElement, strengthAnalysis.strengthLevel);
  
  // 教育学习
  const educationAnalysis = analyzeEducation(shiShenAnalysis.dayMasterType, dayElement);
  
  // 地理分析
  const geographicAnalysis = analyzeGeographicDirection(
    userInput.birthDate,
    userInput.birthTime,
    dayElement,
    shiShenAnalysis.dayMasterType
  );
  
  return {
    careerAnalysis,
    wealthAnalysis,
    marriageAnalysis,
    fengShuiAdvice,
    healthAnalysis,
    educationAnalysis,
    geographicAnalysis
  };
}

/**
 * 事业分析
 */
function analyzeCareer(dayMasterType: string, dayElement: string, isStrong: boolean) {
  const careerDatabase = {
    'Strong': {
      sectors: ['创业', '销售', '管理', '技术', '创意'],
      suitableJobs: ['企业家', '销售经理', '技术总监', '创意总监', '项目经理'],
      score: 8,
      detail: '日主偏强，适合从事需要独立决策和领导能力的行业',
      workStyle: '喜欢独立工作，有较强的领导能力和执行力'
    },
    'Weak': {
      sectors: ['服务', '咨询', '教育', '文化', '行政'],
      suitableJobs: ['教师', '咨询师', '客服经理', '文化工作者', '行政助理'],
      score: 7,
      detail: '日主偏弱，适合从事服务他人或需要团队合作的工作',
      workStyle: '善于团队合作，有耐心，适合服务性质的行业'
    }
  };
  
  const elementBonus = {
    '木': { sectors: ['教育', '文化', '医疗', '环保'], bonus: 1 },
    '火': { sectors: ['传媒', '娱乐', '营销', '公关'], bonus: 2 },
    '土': { sectors: ['房地产', '建筑', '农业', '管理'], bonus: 1 },
    '金': { sectors: ['金融', '法律', '制造', '军警'], bonus: 2 },
    '水': { sectors: ['贸易', '运输', '科技', '通信'], bonus: 1 }
  };
  
  const career = careerDatabase[dayMasterType] || careerDatabase['Weak'];
  const bonus = elementBonus[dayElement] || { sectors: [], bonus: 0 };
  
  // 调整分数
  let finalScore = career.score + bonus.bonus;
  finalScore = Math.min(finalScore, 10);
  
  // 计算潜质
  const leadershipPotential = dayMasterType === 'Strong' ? 8 : 5;
  const entrepreneurshipPotential = isStrong ? 8 : 6;
  const teamworkAbility = dayMasterType === 'Weak' ? 8 : 6;
  
  return {
    recommendedSectors: [...career.sectors, ...bonus.sectors],
    suitableJobs: career.suitableJobs,
    careerScore: finalScore,
    careerDetail: career.detail,
    workStyle: career.workStyle,
    leadershipPotential,
    entrepreneurshipPotential,
    teamworkAbility
  };
}

/**
 * 财富分析
 */
function analyzeWealth(dayMasterType: string, strengthLevel: number, dayElement: string) {
  const wealthDatabase = {
    'Strong': {
      level: 7,
      earning: 8,
      investment: 7,
      saving: 6,
      detail: '命主偏强，有赚钱的能力和动力，适合通过自己的努力积累财富',
      attitude: '主动进取，敢于冒险，有较强的商业头脑',
      timing: '25-35岁期间财运最佳，适合创业或投资'
    },
    'Weak': {
      level: 6,
      earning: 6,
      investment: 5,
      saving: 8,
      detail: '命主偏弱，适合稳健理财，通过时间累积财富',
      attitude: '谨慎保守，善于储蓄理财，风险意识强',
      timing: '30-40岁期间财运稳定上升，稳健投资为主'
    }
  };
  
  const wealth = wealthDatabase[dayMasterType] || wealthDatabase['Weak'];
  
  // 根据日主五行调整
  const elementAdjustment = {
    '水': { investment: +2, earning: +1, saving: 0 },
    '金': { investment: +1, earning: +2, saving: 0 },
    '木': { investment: 0, earning: +1, saving: +1 },
    '火': { investment: +1, earning: +1, saving: 0 },
    '土': { investment: 0, earning: 0, saving: +2 }
  };
  
  const adjustment = elementAdjustment[dayElement] || elementAdjustment['土'];
  
  return {
    wealthLevel: Math.min(wealth.level + Math.floor(strengthLevel / 5), 10),
    earningAbility: Math.min(wealth.earning + (adjustment.earning || 0), 10),
    investmentTalent: Math.min(wealth.investment + (adjustment.investment || 0), 10),
    savingHabits: Math.min(wealth.saving + (adjustment.saving || 0), 10),
    wealthDetail: wealth.detail,
    moneyAttitude: wealth.attitude,
    wealthTiming: wealth.timing
  };
}

/**
 * 婚姻分析
 */
function analyzeMarriage(gender: string, dayMasterType: string, dayAnimal: string) {
  // 男命以财为妻星，女命以官为夫星
  const isMale = gender === 'Male';
  let spouseStar = '';
  let marriageType = '';
  
  if (isMale) {
    spouseStar = '财星';
    marriageType = dayMasterType === 'Strong' ? '妻强夫弱型' : '夫强妻弱型';
  } else {
    spouseStar = '官星';
    marriageType = dayMasterType === 'Strong' ? '女强男弱型' : '男强女弱型';
  }
  
  const compatibility = calculateCompatibility(dayAnimal);
  
  return {
    marriageAge: getMarriageAge(dayMasterType),
    spouseCharacteristics: getSpouseCharacteristics(dayMasterType),
    marriageType,
    marriageScore: 7,
    divorceRisk: getDivorceRisk(dayMasterType),
    compatibility,
    marriageDetail: `配偶为${spouseStar}，${getMarriageDetail(dayMasterType)}`,
    spouseStar
  };
}

/**
 * 风水建议
 */
function analyzeFengShui(dayElement: string, dayMasterType: string) {
  const fengShui = {
    '木': {
      colors: ['绿色', '青色', '浅蓝色'],
      unfavorable: ['金色', '银色', '红色'],
      directions: ['东方', '东南方'],
      unfavorableDir: ['西方', '西北方'],
      elements: ['木', '水'],
      unfavorableEle: ['金', '火'],
      lucky: [3, 8, 1, 6],
      unlucky: [4, 9, 2, 7]
    },
    '火': {
      colors: ['红色', '紫色', '橙色'],
      unfavorable: ['黑色', '蓝色', '绿色'],
      directions: ['南方'],
      unfavorableDir: ['北方'],
      elements: ['火', '木'],
      unfavorableEle: ['水', '金'],
      lucky: [2, 7, 3, 8],
      unlucky: [1, 6, 9, 4]
    },
    '土': {
      colors: ['黄色', '棕色', '米色'],
      unfavorable: ['绿色', '青色'],
      directions: ['中央', '西南', '东北'],
      unfavorableDir: ['东方', '南方'],
      elements: ['土', '火'],
      unfavorableEle: ['木', '水'],
      lucky: [2, 5, 8, 0],
      unlucky: [3, 4, 1, 6]
    },
    '金': {
      colors: ['白色', '金色', '银色'],
      unfavorable: ['绿色', '青色'],
      directions: ['西方', '西北方'],
      unfavorableDir: ['东方', '东南方'],
      elements: ['金', '土'],
      unfavorableEle: ['木', '火'],
      lucky: [4, 9, 1, 6],
      unlucky: [3, 8, 2, 7]
    },
    '水': {
      colors: ['黑色', '蓝色', '灰色'],
      unfavorable: ['红色', '橙色', '紫色'],
      directions: ['北方'],
      unfavorableDir: ['南方'],
      elements: ['水', '金'],
      unfavorableEle: ['土', '火'],
      lucky: [1, 6, 9, 4],
      unlucky: [2, 7, 5, 0]
    }
  };
  
  const analysis = fengShui[dayElement] || fengShui['土'];
  
  return {
    favorableColors: analysis.colors,
    unfavorableColors: analysis.unfavorable,
    favorableDirections: analysis.directions,
    unfavorableDirections: analysis.unfavorableDir,
    favorableElements: analysis.elements,
    unfavorableElements: analysis.unfavorableEle,
    luckyNumbers: analysis.lucky,
    unluckyNumbers: analysis.unlucky,
    fengShuiDetail: `${dayElement}命喜${analysis.elements.join('、')}元素，宜用${analysis.colors.join('、')}色彩`,
    homeArrangement: `家中宜多摆放${dayElement}元素物品，如植物、装饰品等`,
    workplaceArrangement: `办公环境宜朝向${analysis.directions.join('、')}方，坐北朝南为佳`
  };
}

/**
 * 健康分析
 */
function analyzeHealth(dayElement: string, strengthLevel: number) {
  const healthData = {
    '木': {
      level: 7,
      diseases: ['肝胆疾病', '筋骨酸痛', '神经衰弱'],
      tips: ['保持规律作息', '多进行伸展运动', '避免过度饮酒'],
      exercise: '瑜伽、太极、游泳等柔性运动',
      diet: '多吃绿色蔬菜，少食辛辣食物'
    },
    '火': {
      level: 6,
      diseases: ['心血管疾病', '眼睛疾病', '口舌生疮'],
      tips: ['控制情绪', '避免过度劳累', '定期检查血压'],
      exercise: '有氧运动，如慢跑、羽毛球等',
      diet: '少食辛辣刺激食物，多吃清火食品'
    },
    '土': {
      level: 8,
      diseases: ['消化系统疾病', '皮肤过敏', '肌肉劳损'],
      tips: ['规律饮食', '注意休息', '避免暴饮暴食'],
      exercise: '力量训练、散步等稳定运动',
      diet: '饮食清淡，定时定量，多吃粗粮'
    },
    '金': {
      level: 7,
      diseases: ['肺部疾病', '呼吸系统疾病', '皮肤干燥'],
      tips: ['注意呼吸系统保养', '保持空气清新', '戒烟限酒'],
      exercise: '户外运动，登山、骑行等有氧运动',
      diet: '多吃润肺食物，如梨、百合等'
    },
    '水': {
      level: 6,
      diseases: ['肾脏疾病', '生殖系统疾病', '骨关节疾病'],
      tips: ['保暖防寒', '避免过度疲劳', '定期体检'],
      exercise: '游泳、跑步等全身运动',
      diet: '多吃补肾食物，如黑豆、核桃等'
    }
  };
  
  const health = healthData[dayElement] || healthData['土'];
  const finalLevel = Math.min(health.level + Math.floor(strengthLevel / 5), 10);
  
  return {
    healthLevel: finalLevel,
    susceptibleDiseases: health.diseases,
    healthTips: health.tips,
    exerciseRecommendation: health.exercise,
    dietRecommendation: health.diet,
    healthDetail: `${dayElement}命需要特别注意${health.diseases.join('、')}方面的健康`
  };
}

/**
 * 教育学习分析
 */
function analyzeEducation(dayMasterType: string, dayElement: string) {
  const educationData = {
    'Strong': {
      ability: 8,
      subjects: ['理工科', '管理学', '商科', '技术类'],
      fields: ['工程', '商业管理', '信息技术', '创业'],
      method: '适合实践性学习，喜欢动手操作，有较强的独立学习能力'
    },
    'Weak': {
      ability: 7,
      subjects: ['文史哲', '艺术', '教育学', '心理学'],
      fields: ['文学', '艺术设计', '教育', '社会科学'],
      method: '适合系统性学习，善于记忆和理解，有良好的团队学习能力'
    }
  };
  
  const education = educationData[dayMasterType] || educationData['Weak'];
  const elementBonus = {
    '木': { subjects: ['生物学', '教育学'], bonus: 1 },
    '火': { subjects: ['传媒', '表演艺术'], bonus: 1 },
    '土': { subjects: ['建筑', '农业'], bonus: 0 },
    '金': { subjects: ['金融', '法律'], bonus: 2 },
    '水': { subjects: ['语言学', '计算机'], bonus: 1 }
  };
  
  const bonus = elementBonus[dayElement] || { subjects: [], bonus: 0 };
  const finalAbility = Math.min(education.ability + bonus.bonus, 10);
  
  return {
    learningAbility: finalAbility,
    bestSubjects: [...education.subjects, ...bonus.subjects],
    suitableEducationFields: education.fields,
    studyMethod: education.method,
    educationDetail: `${dayMasterType}的学习方式，${education.method}`
  };
}

// ======== 辅助函数 ========

/**
 * 计算兼容性
 */
function calculateCompatibility(dayAnimal: string): any {
  // 简化的兼容性计算
  const compatibility = {
    withElement: { '木': 7, '火': 6, '土': 8, '金': 5, '水': 9 },
    withShengXiao: {
      '鼠': 9, '牛': 8, '虎': 7, '兔': 8, '龙': 9, '蛇': 6,
      '马': 7, '羊': 6, '猴': 8, '鸡': 7, '狗': 8, '猪': 9
    }
  };
  
  return compatibility;
}

/**
 * 获取适合结婚年龄
 */
function getMarriageAge(dayMasterType: string): string {
  const ages = {
    'Strong': '25-28岁',
    'Weak': '23-26岁'
  };
  return ages[dayMasterType] || '25-27岁';
}

/**
 * 获取配偶特征
 */
function getSpouseCharacteristics(dayMasterType: string): string {
  const characteristics = {
    'Strong': '配偶性格独立，有主见，但有时过于自我',
    'Weak': '配偶性格温和，有包容心，善于照顾人'
  };
  return characteristics[dayMasterType] || '配偶性格温和善良';
}

/**
 * 获取离婚风险
 */
function getDivorceRisk(dayMasterType: string): number {
  const risks = {
    'Strong': 3,
    'Weak': 2
  };
  return risks[dayMasterType] || 3;
}

/**
 * 获取婚姻详情
 */
function getMarriageDetail(dayMasterType: string): string {
  const details = {
    'Strong': '夫妻关系较为平等，但需要学会相互包容',
    'Weak': '夫妻关系和谐，配偶容易得到幸福'
  };
  return details[dayMasterType] || '婚姻关系和谐美满';
}