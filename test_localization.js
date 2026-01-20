// 测试本地化命理分析功能
const { analyzeBasicBaZi, generatePersonalityAnalysis } = require('./services/basicAnalysis.ts');
const { generateExtendedAnalysis } = require('./services/extendedAnalysis.ts');

// 测试数据
const testInput = {
  birthDate: '1993-01-01',
  birthTime: '18:12',
  birthLocation: '北京',
  gender: 'Male',
  name: '测试用户'
};

console.log('🧪 开始测试本地化命理分析功能...');
console.log('输入:', testInput);

try {
  // 1. 测试基础分析
  console.log('\n📊 测试基础分析...');
  const basicAnalysis = analyzeBasicBaZi(
    testInput.birthDate,
    testInput.birthTime,
    testInput.birthLocation
  );
  console.log('✅ 基础分析完成');
  console.log('  - 日主:', basicAnalysis.dayElement);
  console.log('  - 日柱:', basicAnalysis.dayGan + basicAnalysis.dayZhi);
  console.log('  - 命主类型:', basicAnalysis.shiShenAnalysis.dayMasterType);

  // 2. 测试扩展分析
  console.log('\n🔮 测试扩展分析...');
  const extendedAnalysis = generateExtendedAnalysis(basicAnalysis, testInput);
  console.log('✅ 扩展分析完成');
  console.log('  - 事业评分:', extendedAnalysis.careerAnalysis.careerScore);
  console.log('  - 财富等级:', extendedAnalysis.wealthAnalysis.wealthLevel);
  console.log('  - 婚姻评分:', extendedAnalysis.marriageAnalysis.marriageScore);

  // 3. 测试性格分析
  console.log('\n🧠 测试性格分析...');
  const personalityAnalysis = generatePersonalityAnalysis(basicAnalysis);
  console.log('✅ 性格分析完成');
  console.log('  - 性格评分:', personalityAnalysis.rating);

  console.log('\n🎉 所有本地化功能测试通过！');

} catch (error) {
  console.error('❌ 测试失败:', error.message);
  console.error(error.stack);
}