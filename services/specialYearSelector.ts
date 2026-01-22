/**
 * 特殊年份选择算法
 * 从100年K线数据中智能选择5-6个最具代表性的年份
 */

export interface YearlyFortuneSimple {
  year: number;
  age: number;
  open: number;
  close: number;
  high: number;
  low: number;
  summary: string;
  isPeak?: boolean;
  isKeyYear?: boolean;
}

export interface SelectedYear extends YearlyFortuneSimple {
  reason: string; // 选中原因（用于prompt）
  priority: number; // 优先级 1-5
}

/**
 * 选择特殊年份算法
 */
export function selectSpecialYears(
  timeline: YearlyFortuneSimple[],
  birthYear: number,
  startAge: number,
  lang: 'zh' | 'en' = 'zh'
): SelectedYear[] {
  const selected: SelectedYear[] = [];
  const usedYears = new Set<number>();

  // 辅助函数：添加年份（避免重复）
  const addYear = (yearData: any, reason: string, priority: number) => {
    if (!usedYears.has(yearData.year)) {
      selected.push({
        ...yearData,
        reason,
        priority
      });
      usedYears.add(yearData.year);
      return true;
    }
    return false;
  };

  // 1. 人生巅峰（20-50岁之间最高的high值）- 必选
  let maxHigh = -Infinity;
  let maxClose = -Infinity;
  let peakYear: any = null;
  let peakIdx = -1;

  timeline.forEach((item, idx) => {
    if (item.age >= 20 && item.age <= 50) {
      if (item.high > maxHigh) {
        maxHigh = item.high;
        maxClose = item.close;
        peakYear = item;
        peakIdx = idx;
      } else if (item.high === maxHigh && item.close > maxClose) {
        maxClose = item.close;
        peakYear = item;
        peakIdx = idx;
      }
    }
  });

  if (peakYear) {
    addYear(peakYear, lang === 'zh' ? '人生巅峰年' : 'Life Peak Year', 1);
  }

  // 2. 最低谷年（任何年龄）- 必选
  let minLow = Infinity;
  let minClose = Infinity;
  let worstYear: any = null;

  timeline.forEach((item) => {
    if (item.low < minLow) {
      minLow = item.low;
      minClose = item.close;
      worstYear = item;
    } else if (item.low === minLow && item.close < minClose) {
      minClose = item.close;
      worstYear = item;
    }
  });

  if (worstYear) {
    addYear(worstYear, lang === 'zh' ? '人生低谷年' : 'Life Lowest Point', 2);
  }

  // 3. 大运开始年 - 选1-2个
  const daYunStartYears = timeline.filter((item) => {
    const ageFromStart = item.age - startAge;
    return ageFromStart >= 0 && ageFromStart % 10 === 0 && item.age >= startAge;
  });

  // 选择前2个大运开始年（在青年期和中年期的）
  const earlyDaYun = daYunStartYears.find(y => y.age >= 25 && y.age <= 35);
  const middleDaYun = daYunStartYears.find(y => y.age >= 35 && y.age <= 50);

  if (earlyDaYun) {
    addYear(earlyDaYun, lang === 'zh' ? '青年期大运开始' : 'Youth DaYun Start', 3);
  }
  if (middleDaYun && usedYears.size < 5) {
    addYear(middleDaYun, lang === 'zh' ? '中年期大运开始' : 'Middle Age DaYun Start', 4);
  }

  // 4. 重大转折年（涨跌幅最大的）- 选1个
  let maxChange = 0;
  let pivotYear: any = null;

  timeline.forEach((item) => {
    const change = Math.abs(item.close - item.open);
    if (change > maxChange) {
      maxChange = change;
      pivotYear = item;
    }
  });

  if (pivotYear && maxChange > 15 && usedYears.size < 5) {
    const changePercent = ((pivotYear.close - pivotYear.open) / pivotYear.open * 100).toFixed(1);
    const direction = pivotYear.close > pivotYear.open ? '上升' : '下降';
    addYear(
      pivotYear,
      lang === 'zh'
        ? `重大转折年（${direction}${changePercent}%）`
        : `Major Pivot (${direction} ${changePercent}%)`,
      5
    );
  }

  // 5. 如果还不足5个，补充一些特殊年份
  if (usedYears.size < 5) {
    // 找波动最大的年份
    let maxVolatility = 0;
    let volatileYear: any = null;

    timeline.forEach((item) => {
      const volatility = item.high - item.low;
      if (volatility > maxVolatility && !usedYears.has(item.year)) {
        maxVolatility = volatility;
        volatileYear = item;
      }
    });

    if (volatileYear && volatileYear.high - volatileYear.low > 20) {
      addYear(
        volatileYear,
        lang === 'zh' ? '波动剧烈年' : 'High Volatility Year',
        6
      );
    }
  }

  // 6. 如果还不足，补一个高评分的年份（不是巅峰）
  if (usedYears.size < 5) {
    const highRatedYear = timeline
      .filter(item => !usedYears.has(item.year) && item.close >= 80 && item.age >= 25 && item.age <= 55)
      .sort((a, b) => b.close - a.close)[0];

    if (highRatedYear) {
      addYear(
        highRatedYear,
        lang === 'zh' ? '运势优异年' : 'Excellent Fortune Year',
        7
      );
    }
  }

  // 按年份排序
  const sorted = selected.sort((a, b) => a.year - b.year);

  console.log('✨ 选中的特殊年份：');
  sorted.forEach((y, i) => {
    console.log(`  ${i + 1}. ${y.year}年(${y.age}岁) - ${y.reason}`);
  });

  return sorted;
}

/**
 * 生成详细点评的prompt
 */
export function createDetailedReviewPrompt(
  years: SelectedYear[],
  lang: 'zh' | 'en' = 'zh'
): string {
  const yearsInfo = years.map(y => {
    return `年份：${y.year}，年龄：${y.age}岁，开：${y.open}，收：${y.close}，高：${y.high}，低：${y.low}，概况：${y.summary}，特殊原因：${y.reason}`;
  }).join('\n');

  const instructions = lang === 'zh' ? `
请为以下${years.length}个特殊年份生成详细的年度点评。

年份信息：
${yearsInfo}

要求：
1. 每个年份包含4个维度：事业、财富、健康、建议
2. 每个维度50-80字
3. 根据K线数值（close值）和特殊原因进行分析
4. 内容要具体、实用，避免空泛
5. 事业：分析工作运势、升职机会、项目运势
6. 财富：分析正财偏财、投资运、消费建议
7. 健康：分析身体状况、注意事项、运动建议
8. 建议：给出一句话的年度建议（20字以内）

返回JSON格式：
{
  "reviews": [
    {
      "year": ${years[0]?.year},
      "career": "事业分析内容...",
      "wealth": "财富分析内容...",
      "health": "健康分析内容...",
      "advice": "年度建议..."
    },
    ...
  ]
}

只返回JSON，无其他内容。
` : `
Please generate detailed annual reviews for the following ${years.length} special years.

Year Information:
${yearsInfo}

Requirements:
1. Each year includes 4 dimensions: Career, Wealth, Health, Advice
2. Each dimension 50-80 characters
3. Analyze based on K-line values (close) and special reasons
4. Content should be specific and practical, avoid vague generalizations
5. Career: Analyze career prospects, promotion opportunities, project fortunes
6. Wealth: Analyze regular and side income, investment fortune, spending advice
7. Health: Analyze physical condition, precautions, exercise recommendations
8. Advice: One sentence annual advice (within 20 characters)

Return JSON format:
{
  "reviews": [
    {
      "year": ${years[0]?.year},
      "career": "Career analysis...",
      "wealth": "Wealth analysis...",
      "health": "Health analysis...",
      "advice": "Annual advice..."
    },
    ...
  ]
}

Return JSON only, nothing else.
`;

  return instructions;
}
