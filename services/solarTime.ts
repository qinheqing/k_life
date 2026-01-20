import { Lunar, Solar } from 'lunar-javascript';
import { getGeoLocation, GeoLocation } from './geoLocation';

export interface SolarTimeResult {
  solarTime: string; // HH:mm
  longitude: number;
  latitude: number;
  timezone: string;
  solarHour: string; // 时辰名称，如"子时"、"丑时"等
  lunarDate: string; // 农历日期，如"一九九二年腊月初九"
}

/**
 * 计算真太阳时
 * 真太阳时 = 平太阳时 + 时差 + 经度修正
 * 
 * 时差（Equation of Time）：
 * 由于地球轨道是椭圆而非正圆，太阳在天空中的实际位置与平太阳位置存在差异
 * 这个差异称为时差，范围大约是 -14分钟到 +16分钟
 * 
 * 经度修正：
 * 每个时区跨越15度经度，每个经度对应4分钟
 * 当地经度与标准经度之差 × 4分钟
 * 
 * @param birthDate 出生日期 YYYY-MM-DD
 * @param birthTime 出生时间 HH:mm
 * @param birthLocation 出生地
 * @returns 真太阳时结果
 */
export async function calculateSolarTime(
  birthDate: string,
  birthTime: string,
  birthLocation: string
): Promise<SolarTimeResult> {
  // 1. 获取地理位置
  const geo = await getGeoLocation(birthLocation);
  
  // 2. 解析日期和时间
  const [year, month, day] = birthDate.split('-').map(Number);
  const [hour, minute] = birthTime.split(':').map(Number);
  
  // 3. 创建 Solar 对象（平太阳时）
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  
  // 4. 转换为 Lunar 对象
  const lunar = solar.getLunar();
  
  // 5. 计算时差（Equation of Time）
  const timeDiff = calculateTimeDifference(solar);
  
  // 6. 计算经度修正（分钟）
  const longitudeCorrection = calculateLongitudeCorrection(geo.lng, geo.timezone);
  
  // 7. 计算总修正时间（分钟）
  const totalCorrectionMinutes = timeDiff + longitudeCorrection;
  
  // 8. 应用修正到出生时间
  const birthTimeMinutes = hour * 60 + minute;
  const solarTimeMinutes = birthTimeMinutes + totalCorrectionMinutes;
  
  // 9. 规范化到 0-1439 分钟（一天1440分钟）
  const normalizedSolarMinutes = ((solarTimeMinutes % 1440) + 1440) % 1440;
  
  // 10. 转换为 HH:mm 格式
  const solarHour = Math.floor(normalizedSolarMinutes / 60);
  const solarMinute = Math.floor(normalizedSolarMinutes % 60);
  const solarTimeStr = `${String(solarHour).padStart(2, '0')}:${String(solarMinute).padStart(2, '0')}`;
  
  // 11. 获取时辰名称
  const solarHourName = getSolarHourName(solarHour);
  
  // 12. 生成农历日期字符串
  const lunarDateStr = formatLunarDate(lunar);
  
  return {
    solarTime: solarTimeStr,
    longitude: geo.lng,
    latitude: geo.lat,
    timezone: geo.timezone,
    solarHour: solarHourName,
    lunarDate: lunarDateStr,
  };
}

/**
 * 计算时差（Equation of Time）
 * 使用更精确的公式计算时差
 * 返回值单位：分钟
 */
function calculateTimeDifference(solar: Solar): number {
  const julianDay = solar.getJulianDay();
  
  // 计算从1月1日开始的日期数
  const dayOfYear = Math.floor(julianDay - 
    new Date(solar.getYear(), 0, 1).getTime() / (1000 * 60 * 60 * 24) + 1);
  
  // 转换为弧度
  const B = (2 * Math.PI / 365) * (dayOfYear - 81);
  
  // 使用美国海军天文台的时差公式（角度已转换为弧度）
  const timeDiffMinutes = 
    9.87 * Math.sin(2 * B) - 
    7.53 * Math.cos(B) - 
    1.5 * Math.sin(B);
  
  return timeDiffMinutes;
}

/**
 * 计算经度修正
 * @param longitude 经度
 * @param timezone 时区
 * @returns 修正时间（分钟）
 */
function calculateLongitudeCorrection(longitude: number, timezone: string): number {
  // 获取时区的标准经度
  const standardLongitude = getStandardLongitude(timezone);
  
  // 计算经度差（度）
  const longitudeDiff = longitude - standardLongitude;
  
  // 每度对应 4 分钟
  const correctionMinutes = longitudeDiff * 4;
  
  return correctionMinutes;
}

/**
 * 获取时区的标准经度
 * @param timezone 时区字符串
 * @returns 标准经度
 */
function getStandardLongitude(timezone: string): number {
  // 主要时区的标准经度
  const timezoneMap: Record<string, number> = {
    'Asia/Shanghai': 120, // UTC+8
    'Asia/Hong_Kong': 114, // UTC+8，但实际使用120度标准
    'Asia/Macau': 113.55, // UTC+8
    'Asia/Taipei': 120, // UTC+8
    'Asia/Tokyo': 135, // UTC+9
    'Asia/Seoul': 135, // UTC+9
    'Asia/Singapore': 105, // UTC+7
    'Asia/Kolkata': 82.5, // UTC+5:30
    'Europe/London': 0, // UTC+0
    'Europe/Paris': 15, // UTC+1
    'Europe/Berlin': 15, // UTC+1
    'America/New_York': -75, // UTC-5
    'America/Los_Angeles': -120, // UTC-8
  };
  
  return timezoneMap[timezone] || 0;
}

/**
 * 获取时辰名称
 * @param hour 小时（0-23）
 * @returns 时辰名称
 */
function getSolarHourName(hour: number): string {
  const hours = [
    '子时', '丑时', '寅时', '卯时',
    '辰时', '巳时', '午时', '未时',
    '申时', '酉时', '戌时', '亥时'
  ];
  
  // 子时跨越 23:00-01:00
  if (hour === 23 || hour === 0) return '子时';
  
  // 其他时辰：23时到1时为子时，之后每2小时一个时辰
  // 将小时转换为时辰索引
  let index = Math.floor((hour + 1) / 2);
  if (index >= 12) index = 0;
  
  return hours[index];
}

/**
 * 格式化农历日期
 * @param lunar Lunar对象
 * @returns 格式化的农历日期字符串，如"壬申年腊月初九"
 */
function formatLunarDate(lunar: Lunar): string {
  const yearInGanZhi = lunar.getYearInGanZhi(); // 干支纪年
  const month = lunar.getMonthInChinese();
  const day = lunar.getDayInChinese();
  
  // 为月份添加"月"字（如果已有则不重复添加）
  const monthStr = month.includes('月') ? month : month + '月';
  
  return `${yearInGanZhi}年${monthStr}${day}`;
}

/**
 * 格式化真太阳时差异（用于调试）
 * @param solarTimeObj 真太阳时结果
 * @param originalBirthTime 原始出生时间 HH:mm
 * @returns 格式化的差异描述
 */
export function formatSolarTimeDifference(
  solarTimeObj: SolarTimeResult,
  originalBirthTime: string
): string {
  const [origHour, origMinute] = originalBirthTime.split(':').map(Number);
  const origMinutes = origHour * 60 + origMinute;
  
  const [solarHour, solarMinute] = solarTimeObj.solarTime.split(':').map(Number);
  const solarMinutes = solarHour * 60 + solarMinute;
  
  const diffMinutes = solarMinutes - origMinutes;
  const diffHours = Math.floor(diffMinutes / 60);
  const diffMins = Math.abs(diffMinutes % 60);
  
  if (diffMinutes === 0) {
    return '真太阳时与平太阳时相同';
  }
  
  const sign = diffMinutes > 0 ? '+' : '-';
  return `真太阳时比平太阳时${sign}${Math.abs(diffHours)}小时${diffMins}分钟`;
}
