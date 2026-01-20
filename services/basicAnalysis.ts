import { Solar, Lunar } from 'lunar-javascript';
import { UserInput } from '../types';

export interface BasicAnalysisResult {
  // 命主基础信息
  mainAttribute: string; // 命主属性 (如"阳水命")
  dayGan: string; // 日干
  dayZhi: string; // 日支
  dayElement: string; // 日主五行
  
  // 四柱详细信息
  pillars: {
    year: { gan: string; zhi: string; wuxing: string; naYin: string; shengXiao: string; };
    month: { gan: string; zhi: string; wuxing: string; naYin: string; shengXiao: string; };
    day: { gan: string; zhi: string; wuxing: string; naYin: string; shengXiao: string; };
    hour: { gan: string; zhi: string; wuxing: string; naYin: string; shengXiao: string; };
  };
  
  // 十神分析
  shiShenAnalysis: {
    year: string; // 年干十神
    month: string; // 月干十神
    day: string; // 日干十神
    hour: string; // 时干十神
    dayMasterShiShen: string; // 日主十神
    dayMasterType: string; // 日主类型 (比肩、劫财、食神等)
  };
  
  // 基础分析
  basicAnalysis: {
    wuxing: {
      year: string; // 年柱五行
      month: string; // 月柱五行
      day: string; // 日柱五行
      hour: string; // 时柱五行
      dayMaster: string; // 日主五行
    };
    
    naYin: {
      year: string; // 年纳音
      month: string; // 月纳音
      day: string; // 日纳音
      hour: string; // 时纳音
      description: string; // 纳音解释
    };
    
    shengXiao: {
      year: string; // 年生肖
      month: string; // 月生肖
      day: string; // 日生肖
      hour: string; // 时生肖
    };
    
    chongSha: {
      dayChong: string; // 日支冲的生肖
      dayChongGan: string; // 冲的干
      dayChongZhi: string; // 冲的支
      daySha: string; // 日支的煞
    };
  };
  
  // 命主强弱判断
  strengthAnalysis: {
    isStrong: boolean;
    isWeak: boolean;
    strengthLevel: number; // 1-10
    strengthDescription: string;
    dayMasterBalance: string; // 日主平衡情况
  };
}

/**
 * 基础命理分析
 * 基于本地 lunar-javascript 计算所有基础命理信息
 */
export function analyzeBasicBaZi(
  birthDate: string,
  birthTime: string,
  birthLocation: string
): BasicAnalysisResult {
  // 1. 创建Solar对象并获取Lunar对象
  const [year, month, day] = birthDate.split('-').map(Number);
  const [hour, minute] = birthTime.split(':').map(Number);
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();
  
  // 2. 基础数据提取
  const dayGan = lunar.getDayGan();
  const dayZhi = lunar.getDayZhi();
  const dayElement = getWuxingFromGan(dayGan);
  const isYang = isYangGan(dayGan);
  
  // 3. 命主属性
  const mainAttribute = `${isYang ? '阳' : '阴'}${dayElement}命`;
  
  // 4. 四柱详细信息
  const pillars = {
    year: {
      gan: lunar.getYearGan(),
      zhi: lunar.getYearZhi(),
      wuxing: getWuxingFromZhi(lunar.getYearZhi()),
      naYin: lunar.getYearNaYin(),
      shengXiao: lunar.getYearShengXiao()
    },
    month: {
      gan: lunar.getMonthGan(),
      zhi: lunar.getMonthZhi(),
      wuxing: getWuxingFromZhi(lunar.getMonthZhi()),
      naYin: lunar.getMonthNaYin(),
      shengXiao: lunar.getMonthShengXiao()
    },
    day: {
      gan: dayGan,
      zhi: dayZhi,
      wuxing: getWuxingFromZhi(dayZhi),
      naYin: lunar.getDayNaYin(),
      shengXiao: lunar.getDayShengXiao()
    },
    hour: {
      gan: lunar.getTimeGan(),
      zhi: lunar.getTimeZhi(),
      wuxing: getWuxingFromZhi(lunar.getTimeZhi()),
      naYin: lunar.getTimeNaYin(),
      shengXiao: lunar.getTimeShengXiao()
    }
  };
  
  // 5. 十神分析
  const shiShenData = lunar.getBaZiShiShenGan();
  const shiShenAnalysis = {
    year: shiShenData[0],
    month: shiShenData[1], 
    day: shiShenData[2],
    hour: shiShenData[3],
    dayMasterShiShen: shiShenData[2],
    dayMasterType: getShiShenType(shiShenData[2])
  };
  
  // 6. 基础分析汇总
  const basicAnalysis = {
    wuxing: {
      year: pillars.year.wuxing,
      month: pillars.month.wuxing,
      day: pillars.day.wuxing,
      hour: pillars.hour.wuxing,
      dayMaster: dayElement
    },
    
    naYin: {
      year: pillars.year.naYin,
      month: pillars.month.naYin,
      day: pillars.day.naYin,
      hour: pillars.hour.naYin,
      description: getNaYinDescription(pillars.day.naYin)
    },
    
    shengXiao: {
      year: pillars.year.shengXiao,
      month: pillars.month.shengXiao,
      day: pillars.day.shengXiao,
      hour: pillars.hour.shengXiao
    },
    
    chongSha: {
      dayChong: lunar.getChong(),
      dayChongGan: lunar.getChongGan(),
      dayChongZhi: lunar.getChongGanTie(),
      daySha: getDaySha(dayZhi)
    }
  };
  
  // 7. 命主强弱分析
  const strengthAnalysis = analyzeStrength(dayElement, shiShenAnalysis.dayMasterType, basicAnalysis.wuxing);
  
  return {
    mainAttribute,
    dayGan,
    dayZhi,
    dayElement,
    pillars,
    shiShenAnalysis,
    basicAnalysis,
    strengthAnalysis
  };
}

// ======== 辅助函数 ========

/**
 * 获取天干对应的五行
 */
function getWuxingFromGan(gan: string): string {
  const wuxingMap: Record<string, string> = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水'
  };
  return wuxingMap[gan] || '';
}

/**
 * 获取地支对应的五行
 */
function getWuxingFromZhi(zhi: string): string {
  const wuxingMap: Record<string, string> = {
    '子': '水', '亥': '水',
    '寅': '木', '卯': '木',
    '巳': '火', '午': '火',
    '申': '金', '酉': '金',
    '辰': '土', '戌': '土', '丑': '土', '未': '土'
  };
  return wuxingMap[zhi] || '';
}

/**
 * 判断是否为阳干
 */
function isYangGan(gan: string): boolean {
  const yangGans = ['甲', '丙', '戊', '庚', '壬'];
  return yangGans.includes(gan);
}

/**
 * 获取十神类型
 */
function getShiShenType(shiShen: string): string {
  const shiShenMap: Record<string, string> = {
    '比肩': 'Strong',
    '劫财': 'Strong',
    '食神': 'Strong',
    '伤官': 'Strong',
    '偏财': 'Weak',
    '正财': 'Weak',
    '七杀': 'Weak',
    '正官': 'Weak',
    '偏印': 'Weak',
    '正印': 'Weak'
  };
  return shiShenMap[shiShen] || '';
}

/**
 * 获取纳音描述
 */
function getNaYinDescription(naYin: string): string {
  const descriptions: Record<string, string> = {
    '剑锋金': '性格坚毅，有决断力，适合从事金融、法律等行业',
    '桑柘木': '性格温和，善于培育，适合教育、文化行业',
    '杨柳木': '适应力强，善于变化，适合服务业、艺术行业',
    '大驿土': '稳重踏实，有包容力，适合管理、建筑行业',
    '壁上土': '有靠山，容易得到贵人相助',
    '金箔金': '表面光鲜，内心实诚，适合装饰、美容行业',
    '覆灯火': '光明磊落，有正义感，适合传媒、公关行业',
    '天河水': '聪明灵活，适应力强，适合贸易、科技行业',
    '大海水': '深沉包容，智慧深邃，适合哲学、宗教行业',
    '沙中金': '内秀外朴，有潜在力量，需要挖掘发挥'
  };
  return descriptions[naYin] || '纳音独特，个性鲜明';
}

/**
 * 获取日支的煞
 */
function getDaySha(dayZhi: string): string {
  const shaMap: Record<string, string> = {
    '子': '北', '丑': '东北', '寅': '东北', '卯': '东',
    '辰': '东南', '巳': '东南', '午': '南', '未': '西南',
    '申': '西南', '酉': '西', '戌': '西北', '亥': '西北'
  };
  return shaMap[dayZhi] || '';
}

/**
 * 分析命主强弱
 */
function analyzeStrength(dayElement: string, dayMasterType: string, wuxing: any) {
  // 简化的强弱判断逻辑
  let strengthLevel = 5; // 基础分数
  let isStrong = false;
  let isWeak = false;
  let description = '';
  
  if (dayMasterType === 'Strong') {
    isStrong = true;
    strengthLevel = 7;
    description = '命主偏强，日主有力，性格坚韧独立';
  } else if (dayMasterType === 'Weak') {
    isWeak = true;
    strengthLevel = 3;
    description = '命主偏弱，需要生扶，性格温和包容';
  } else {
    strengthLevel = 5;
    description = '命主平衡，中正平和，适应性强';
  }
  
  return {
    isStrong,
    isWeak,
    strengthLevel,
    strengthDescription: description,
    dayMasterBalance: isStrong ? '偏强' : (isWeak ? '偏弱' : '平衡')
  };
}

/**
 * 生成性格特征分析
 */
export function generatePersonalityAnalysis(analysis: BasicAnalysisResult): {
  traits: string[];
  detailedAnalysis: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
} {
  const { dayElement, shiShenAnalysis, strengthAnalysis } = analysis;
  
  const baseTraits = getPersonalityByElement(dayElement);
  const shiShenTraits = getPersonalityByShiShen(shiShenAnalysis.dayMasterType);
  
  const detailedAnalysis = `
${dayElement}主性格，具有${baseTraits.mainTrait}。
${shiShenAnalysis.dayMasterType}的十神特质表现为${shiShenTraits.detail}。
整体来说，${strengthAnalysis.strengthDescription}。
  `.trim();
  
  return {
    traits: [...baseTraits.traits, ...shiShenTraits.traits],
    detailedAnalysis,
    strengths: [...baseTraits.strengths, ...shiShenTraits.strengths],
    weaknesses: [...baseTraits.weaknesses, ...shiShenTraits.weaknesses],
    recommendations: [...baseTraits.recommendations, ...shiShenTraits.recommendations]
  };
}

/**
 * 基于日主五行的性格特征
 */
function getPersonalityByElement(element: string): any {
  const personalities: Record<string, any> = {
    '木': {
      mainTrait: '仁慈善良，具有开拓精神',
      traits: ['仁慈', '善良', '有开拓精神', '善于成长学习'],
      strengths: ['仁慈善良', '有进取心', '学习能力强', '有同情心'],
      weaknesses: ['有时过于理想化', '缺乏现实感'],
      recommendations: ['多接触现实社会', '培养实际能力']
    },
    '火': {
      mainTrait: '热情外向，具有领导能力',
      traits: ['热情', '外向', '有领导能力', '积极主动'],
      strengths: ['热情开朗', '有感染力', '领导能力强', '行动力强'],
      weaknesses: ['有时过于急躁', '缺乏耐心'],
      recommendations: ['培养耐心', '学会冷静思考']
    },
    '土': {
      mainTrait: '稳重踏实，具有包容性',
      traits: ['稳重', '踏实', '有包容性', '务实可靠'],
      strengths: ['稳重可靠', '包容心强', '执行力强', '有责任感'],
      weaknesses: ['有时过于保守', '缺乏创新'],
      recommendations: ['尝试新事物', '培养创新思维']
    },
    '金': {
      mainTrait: '坚毅果断，具有组织能力',
      traits: ['坚毅', '果断', '有组织能力', '注重原则'],
      strengths: ['意志坚强', '决策果断', '组织能力强', '有原则性'],
      weaknesses: ['有时过于严厉', '缺乏灵活性'],
      recommendations: ['学会灵活变通', '培养人情味']
    },
    '水': {
      mainTrait: '智慧灵活，适应力强',
      traits: ['智慧', '灵活', '适应力强', '善于沟通'],
      strengths: ['智慧聪明', '适应力强', '沟通能力强', '思路敏捷'],
      weaknesses: ['有时过于多变', '缺乏坚持性'],
      recommendations: ['培养坚持性', '增强定力']
    }
  };
  
  return personalities[element] || personalities['土'];
}

/**
 * 基于十神的性格特征
 */
function getPersonalityByShiShen(shiShenType: string): any {
  const personalities: Record<string, any> = {
    'Strong': {
      detail: '独立自主，有主见，与兄弟朋友关系好，但有时过于自我',
      traits: ['独立', '自主', '有主见', '重友情'],
      strengths: ['独立性强', '有主见', '朋友关系好', '有担当'],
      weaknesses: ['有时过于自我', '缺乏妥协'],
      recommendations: ['学会合作', '培养包容心']
    },
    'Weak': {
      detail: '依赖性强，但善于得到他人帮助，人际关系和谐',
      traits: ['依赖', '有贵人相助', '人际关系好'],
      strengths: ['人际关系好', '容易得到帮助', '适应能力强'],
      weaknesses: ['依赖性强', '缺乏主见'],
      recommendations: ['培养独立性', '增强自信心']
    }
  };
  
  return personalities[shiShenType] || personalities['Weak'];
}