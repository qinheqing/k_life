import { Solar, Lunar } from 'lunar-javascript';
import { UserInput } from '../types';

export interface GeographicAnalysisData {
  favorableProvinces: string[];
  favorableCities: string[];
  unfavorableRegions: string[];
  careerMatch: Record<string, number>;
}

/**
 * 地理发展分析
 * 基于日主五行和十神，分析适合发展的地理方位和城市类型
 */
export function analyzeGeographicDirection(
  birthDate: string,
  birthTime: string,
  dayElement: string,
  dayMasterType: string
): GeographicAnalysisData {
  // 1. 创建Solar对象获取基础数据
  const [year, month, day] = birthDate.split('-').map(Number);
  const [hour, minute] = birthTime.split(':').map(Number);
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();
  const dayZhi = lunar.getDayZhi();

  // 2. 根据日主五行分析
  const directionData = getDirectionData(dayElement, dayMasterType);
  
  // 3. 推荐省份和城市
  const { provinces, cities } = getRecommendedLocations(dayElement, directionData.favorableDirections);
  
  // 4. 职业匹配度
  const careerMatch = calculateCareerMatch(dayElement, dayZhi);

  return {
    favorableProvinces: provinces,
    favorableCities: cities,
    unfavorableRegions: directionData.unfavorableDirections,
    careerMatch
  };
}

/**
 * 获取方位数据
 */
function getDirectionData(dayElement: string, dayMasterType: string): {
  favorableDirections: string[];
  unfavorableDirections: string[];
} {
  const directionDatabase = {
    '木': {
      favorable: ['东方', '东南方', '南方'],
      unfavorable: ['西方', '西北方', '北方']
    },
    '火': {
      favorable: ['南方', '东南方', '东方'],
      unfavorable: ['北方', '西方', '西北方']
    },
    '土': {
      favorable: ['中央', '西南方', '东北方'],
      unfavorable: ['东方', '南方', '北方']
    },
    '金': {
      favorable: ['西方', '西北方', '东北方'],
      unfavorable: ['东方', '东南方', '南方']
    },
    '水': {
      favorable: ['北方', '西北方', '西方'],
      unfavorable: ['南方', '东南方', '东方']
    }
  };

  const data = directionDatabase[dayElement] || directionDatabase['土'];
  
  // 根据日主强弱调整
  if (dayMasterType === 'Strong') {
    // 强命需要泄秀，可以适当考虑相克方位
    return {
      favorableDirections: [...data.favorable, data.unfavorable.slice(0, 1)],
      unfavorableDirections: data.unfavorable.slice(1)
    };
  }

  return data;
}

/**
 * 获取推荐地点
 */
function getRecommendedLocations(dayElement: string, favorableDirections: string[]): {
  provinces: string[];
  cities: string[];
} {
  const locationDatabase = {
    '木': {
      provinces: ['江苏', '浙江', '安徽', '江西', '福建', '湖南', '湖北'],
      cities: ['苏州', '杭州', '南京', '长沙', '武汉', '南昌', '福州', '厦门']
    },
    '火': {
      provinces: ['广东', '福建', '云南', '四川', '重庆', '广西'],
      cities: ['广州', '深圳', '成都', '重庆', '昆明', '南宁', '厦门', '福州']
    },
    '土': {
      provinces: ['河南', '河北', '山东', '山西', '陕西'],
      cities: ['郑州', '石家庄', '济南', '太原', '西安', '洛阳', '开封', '大同']
    },
    '金': {
      provinces: ['北京', '上海', '天津', '河北', '山西'],
      cities: ['北京', '上海', '天津', '石家庄', '太原', '保定', '唐山', '邯郸']
    },
    '水': {
      provinces: ['黑龙江', '吉林', '辽宁', '天津', '河北', '山东'],
      cities: ['哈尔滨', '长春', '沈阳', '大连', '天津', '青岛', '济南', '烟台']
    }
  };

  const data = locationDatabase[dayElement] || locationDatabase['土'];
  
  return {
    provinces: data.provinces,
    cities: data.cities
  };
}

/**
 * 计算职业匹配度
 */
function calculateCareerMatch(dayElement: string, dayZhi: string): Record<string, number> {
  // 简化的职业匹配逻辑
  const matchScores: Record<string, number> = {
    '一线城市': 8,
    '二线城市': 7,
    '三线城市': 6,
    '沿海城市': 7,
    '内陆城市': 6,
    '省会城市': 7,
    '工业城市': 5,
    '科技城市': 8,
    '文化城市': 6,
    '旅游城市': 5
  };

  // 根据日主五行调整
  const elementBonus = {
    '木': { '文化城市': +2, '教育城市': +2, '环保城市': +2 },
    '火': { '传媒城市': +2, '娱乐城市': +2, '科技城市': +1 },
    '土': { '省会城市': +1, '农业城市': +2, '工业城市': +1 },
    '金': { '金融城市': +2, '工业城市': +2, '法律城市': +1 },
    '水': { '贸易城市': +2, '港口城市': +2, '科技城市': +1 }
  };

  const bonus = elementBonus[dayElement] || {};
  
  // 应用加成
  Object.keys(bonus).forEach(city => {
    if (matchScores[city] !== undefined) {
      matchScores[city] = Math.min(matchScores[city] + bonus[city], 10);
    }
  });

  return matchScores;
}
