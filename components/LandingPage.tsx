import React from 'react';
import { Sparkles, TrendingUp, Globe, BarChart3, Shield, Zap, ArrowRight } from 'lucide-react';
import { Language } from '../types';
import { getTexts } from '../locales';

interface LandingPageProps {
  onGetStarted: () => void;
  lang: Language;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, lang }) => {
  const t = getTexts(lang);

  const features = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      titleZh: "AI 智能分析",
      titleEn: "AI-Powered Analysis",
      descZh: "基于 Gemini AI 深度学习，精准解析八字命理，生成个性化的人生运势报告",
      descEn: "Powered by Gemini AI for deep analysis of BaZi numerology and personalized life fortune reports"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      titleZh: "K线可视化",
      titleEn: "K-Line Visualization",
      descZh: "100年运势以金融K线形式呈现，直观展示人生起伏，发现关键转折点",
      descEn: "100-year fortune displayed as financial K-lines, visualizing life's ups and downs intuitively"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      titleZh: "真太阳时校准",
      titleEn: "True Solar Time",
      descZh: "根据出生地经纬度自动计算真太阳时，确保八字排盘精准无误",
      descEn: "Automatically calculates true solar time based on birthplace coordinates for accurate BaZi"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      titleZh: "隐私安全",
      titleEn: "Privacy & Security",
      descZh: "所有数据本地处理，不存储个人信息，保护您的隐私安全",
      descEn: "All data processed locally, no personal information stored, protecting your privacy"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      titleZh: "多维度解析",
      titleEn: "Multi-Dimensional Analysis",
      descZh: "涵盖事业、财富、婚姻、性格等6大维度，提供全面的人生指引",
      descEn: "Covers 6 dimensions including career, wealth, marriage, and personality for comprehensive guidance"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      titleZh: "PDF报告导出",
      titleEn: "PDF Export",
      descZh: "一键生成精美PDF报告，永久保存您的命运分析结果",
      descEn: "Generate beautiful PDF reports with one click, preserve your destiny analysis forever"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-50 dark:from-amber-50 dark:via-orange-50 dark:to-amber-50 transition-colors duration-200">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
        {/* Version Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-600 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-600 text-sm mb-8 backdrop-blur-sm transition-colors duration-200">
          <Sparkles className="w-4 h-4" />
          <span>{lang === 'zh' ? '基于AI深度训练模型驱动' : 'Powered by Advanced AI Models'} v1.0</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-gray-800 mb-4 tracking-tight transition-colors duration-200">
          {lang === 'zh' ? '洞悉命运起伏' : 'Life Fortune Analysis'}
        </h1>
        <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
          <span className="bg-gradient-to-r from-teal-500 to-cyan-500 dark:from-orange-500 dark:to-amber-500 bg-clip-text text-transparent transition-all duration-200">
            {lang === 'zh' ? '预见人生轨迹' : 'Visualize Your Destiny'}
          </span>
        </h2>

        {/* Subtitle */}
        <p className="text-xl text-gray-600 dark:text-gray-700 max-w-3xl mx-auto mb-12 leading-relaxed transition-colors duration-200">
          {lang === 'zh'
            ? '结合传统八字命理与现代金融数据可视化，将您的一生运势转化为直观的K线图。基于AI深度分析，助您发现人生牛市，规避风险熊市，把握关键转折点。'
            : 'Combining traditional BaZi numerology with modern financial visualization. Transform your lifetime fortune into intuitive K-line charts. Discover your bull markets, avoid bear risks, and seize key turning points.'
          }
        </p>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
          <button
            onClick={onGetStarted}
            className="group px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 dark:bg-orange-500 dark:hover:bg-orange-600 dark:shadow-orange-500/30 dark:hover:shadow-orange-500/50"
          >
            {lang === 'zh' ? '开始分析' : 'Get Started'}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Demo Screenshot - K-Line Chart */}
        <div id="demo" className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-amber-200 bg-white/50 dark:bg-amber-50/50 backdrop-blur transition-colors duration-200">
          <div className="absolute top-0 left-0 right-0 h-10 bg-white/80 dark:bg-amber-100/80 backdrop-blur flex items-center px-4 gap-2 border-b border-gray-200 dark:border-amber-200 transition-colors duration-200">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div className="ml-4 text-xs text-gray-500 dark:text-gray-700 font-mono transition-colors duration-200">
              {lang === 'zh' ? 'app.lifekline.com' : 'app.lifekline.com'}
            </div>
          </div>
          <div className="pt-10">
            <img
              src="/doc/k线.png"
              alt="K-Line Chart Demo"
              className="w-full h-auto"
              onError={(e) => {
                // Fallback if image doesn't load
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-800 mb-4 transition-colors duration-200">
            {lang === 'zh' ? '核心功能' : 'Core Features'}
          </h3>
          <p className="text-gray-600 dark:text-gray-700 text-lg transition-colors duration-200">
            {lang === 'zh'
              ? '现代科技与传统命理的完美结合'
              : 'Perfect blend of modern technology and traditional numerology'
            }
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-white dark:bg-white border border-gray-200 dark:border-amber-200 hover:border-teal-500/50 dark:hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10 dark:hover:shadow-orange-500/10 backdrop-blur"
            >
              <div className="w-12 h-12 rounded-lg bg-teal-500/10 dark:bg-orange-500/10 text-teal-600 dark:text-orange-600 flex items-center justify-center mb-4 transition-colors duration-200">
                {feature.icon}
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-800 mb-2 transition-colors duration-200">
                {lang === 'zh' ? feature.titleZh : feature.titleEn}
              </h4>
              <p className="text-gray-600 dark:text-gray-700 leading-relaxed transition-colors duration-200">
                {lang === 'zh' ? feature.descZh : feature.descEn}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="rounded-2xl bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-amber-100 dark:to-orange-100 border border-teal-200 dark:border-amber-300 p-12 backdrop-blur transition-colors duration-200">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-800 mb-4 transition-colors duration-200">
            {lang === 'zh' ? '开启您的命运之旅' : 'Start Your Journey'}
          </h3>
          <p className="text-gray-600 dark:text-gray-700 text-lg mb-8 transition-colors duration-200">
            {lang === 'zh'
              ? '只需几分钟，即可获得专业的AI命运分析报告'
              : 'Get your professional AI destiny analysis in minutes'
            }
          </p>
          <button
            onClick={onGetStarted}
            className="group px-10 py-5 bg-teal-500 hover:bg-teal-600 text-white text-lg font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 mx-auto shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 dark:bg-orange-500 dark:hover:bg-orange-600 dark:shadow-orange-500/30 dark:hover:shadow-orange-500/50"
          >
            {lang === 'zh' ? '立即开始' : 'Get Started Now'}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Footer Note */}
      <div className="max-w-6xl mx-auto px-4 pb-12 text-center">
        <p className="text-gray-500 dark:text-gray-600 text-sm transition-colors duration-200">
          {lang === 'zh'
            ? '本项目仅供娱乐和文化研究使用 • 开源项目 • MIT License'
            : 'For entertainment and cultural research only • Open Source • MIT License'
          }
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
