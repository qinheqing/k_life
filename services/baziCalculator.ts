import { Solar, Lunar } from 'lunar-javascript';
import { UserInput } from '../types';

export interface BaZiPillars {
  year: { gan: string; zhi: string };
  month: { gan: string; zhi: string };
  day: { gan: string; zhi: string };
  hour: { gan: string; zhi: string };
}

export interface BaZiCalculationResult {
  pillars: BaZiPillars;
  lunarDate: string;
  solarTime: string;
  solarHour: string;
  startAge: number;
  direction: '顺行' | '逆行';
  daYun: string[];
}

/**
 * 本地计算四柱八字
 * 使用 lunar-javascript 库进行精确计算，避免AI错误
 */
export function calculateBaZiLocal(
  birthDate: string,
  birthTime: string,
  birthLocation: string
): BaZiCalculationResult {
  // 1. 解析日期时间
  const [year, month, day] = birthDate.split('-').map(Number);
  const [hour, minute] = birthTime.split(':').map(Number);
  
  // 2. 创建 Solar 对象
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  
  // 3. 转换为 Lunar 对象
  const lunar = solar.getLunar();
  
  // 4. 计算四柱
  const pillars = calculatePillars(solar, lunar);
  
  // 5. 计算起运信息
  const startInfo = calculateStartAge(lunar);
  
  // 6. 计算大运
  const daYun = calculateDaYun(pillars, startInfo.direction, startInfo.startAge);
  
  // 7. 格式化农历日期
  const lunarDate = formatLunarDate(lunar);
  
  // 8. 获取时辰
  const solarHour = getSolarHourName(hour);
  
  return {
    pillars,
    lunarDate,
    solarTime: birthTime,
    solarHour,
    startAge: startInfo.startAge,
    direction: startInfo.direction,
    daYun,
  };
}

/**
 * 计算四柱
 */
function calculatePillars(solar: Solar, lunar: Lunar): BaZiPillars {
  // 年柱
  const yearGan = lunar.getYearGan();
  const yearZhi = lunar.getYearZhi();
  
  // 月柱
  const monthGan = lunar.getMonthGan();
  const monthZhi = lunar.getMonthZhi();
  
  // 日柱
  const dayGan = lunar.getDayGan();
  const dayZhi = lunar.getDayZhi();
  
  // 时柱
  const hourGan = lunar.getTimeGan();
  const hourZhi = lunar.getTimeZhi();
  
  return {
    year: { gan: yearGan, zhi: yearZhi },
    month: { gan: monthGan, zhi: monthZhi },
    day: { gan: dayGan, zhi: dayZhi },
    hour: { gan: hourGan, zhi: hourZhi },
  };
}

/**
 * 计算起运岁数和方向
 */
function calculateStartAge(lunar: Lunar): { startAge: number; direction: '顺行' | '逆行' } {
  // 暂时使用默认值，后续可以完善
  return {
    startAge: 8,  // 大多数情况下8岁起运
    direction: '顺行',  // 默认顺行
  };
}

/**
 * 计算大运
 */
function calculateDaYun(pillars: BaZiPillars, direction: '顺行' | '逆行', startAge: number): string[] {
  const daYun: string[] = [];
  
  // 以年柱为基础推算大运
  let currentGanIndex = getGanIndex(pillars.year.gan);
  let currentZhiIndex = getZhiIndex(pillars.year.zhi);
  
  const step = direction === '顺行' ? 1 : -1;
  
  // 计算10个大运
  for (let i = 0; i < 10; i++) {
    const ganIndex = (currentGanIndex + step * i + 10) % 10;
    const zhiIndex = (currentZhiIndex + step * i + 12) % 12;
    
    const gan = GANS[ganIndex];
    const zhi = ZHIS[zhiIndex];
    
    daYun.push(gan + zhi);
  }
  
  return daYun;
}

/**
 * 获取时辰名称
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
  let index = Math.floor((hour + 1) / 2);
  if (index >= 12) index = 0;
  
  return hours[index];
}

/**
 * 格式化农历日期
 */
function formatLunarDate(lunar: Lunar): string {
  const yearInGanZhi = lunar.getYearInGanZhi();
  const month = lunar.getMonthInChinese();
  const day = lunar.getDayInChinese();
  
  // 为月份添加"月"字（如果已有则不重复添加）
  const monthStr = month.includes('月') ? month : month + '月';
  
  return `${yearInGanZhi}年${monthStr}${day}`;
}

// 天干索引映射
const GANS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支索引映射
const ZHIS = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/**
 * 获取天干索引
 */
function getGanIndex(gan: string): number {
  return GANS.indexOf(gan);
}

/**
 * 获取地支索引
 */
function getZhiIndex(zhi: string): number {
  return ZHIS.indexOf(zhi);
}