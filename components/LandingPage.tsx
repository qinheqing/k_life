import React, { useEffect, useRef } from 'react';
import { Sparkles, TrendingUp, Globe, BarChart3, Shield, Zap, ArrowRight, Star, Crown, Gem } from 'lucide-react';
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
    <div className="min-h-screen relative overflow-hidden bg-[var(--bg-primary)] transition-colors duration-300">
      {/* Background Decoration - 柔和背景装饰 */}
      <div className="bg-decoration">
        <div className="bg-orb bg-orb-1 animate-float" style={{background: 'var(--accent-primary)', opacity: 0.06}}></div>
        <div className="bg-orb bg-orb-2 animate-float" style={{animationDelay: '-10s', background: 'var(--accent-secondary)', opacity: 0.04}}></div>
        <div className="bg-orb bg-orb-3 animate-float" style={{animationDelay: '-5s', background: 'var(--accent-emphasis)', opacity: 0.05}}></div>
      </div>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 pt-24 pb-20">
        {/* Floating Elements - 使用新配色 */}
        <div className="absolute top-32 left-10 animate-float" style={{animationDelay: '2s'}}>
          <div className="glass-card p-4 animate-luxury-glow">
            <Star className="w-6 h-6" style={{color: 'var(--accent-primary)'}} />
          </div>
        </div>
        <div className="absolute top-40 right-20 animate-float" style={{animationDelay: '4s'}}>
          <div className="glass-card p-3 animate-luxury-glow" style={{animationDelay: '1s'}}>
            <Crown className="w-8 h-8" style={{color: 'var(--accent-emphasis)'}} />
          </div>
        </div>
        <div className="absolute top-60 left-1/4 animate-float" style={{animationDelay: '6s'}}>
          <div className="glass-card p-3 animate-luxury-glow" style={{animationDelay: '3s'}}>
            <Gem className="w-6 h-6" style={{color: 'var(--accent-secondary)'}} />
          </div>
        </div>

        {/* Premium Badge */}
        <div className="flex justify-center mb-12">
          <div className="glass-card-light px-6 py-3 animate-luxury-scale-in">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Sparkles className="w-5 h-5 animate-pulse" style={{color: 'var(--accent-primary)'}} />
                <div className="absolute inset-0 animate-ping">
                  <Sparkles className="w-5 h-5 opacity-75" style={{color: 'var(--accent-primary)'}} />
                </div>
              </div>
              <span className="text-sm font-medium tracking-wide" style={{color: 'var(--accent-primary)'}}>
                {lang === 'zh' ? 'AI深度训练模型驱动' : 'Powered by Advanced AI Models'}
              </span>
              <div className="px-2 py-1 rounded-full" style={{backgroundColor: 'var(--accent-glow)'}}>
                <span className="text-xs font-bold" style={{color: 'var(--accent-emphasis)'}}>v2.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Heading */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-bold luxury-heading mb-6 animate-luxury-fade-in">
            {lang === 'zh' ? '洞悉命运奥秘' : 'Unlock Destiny Secrets'}
          </h1>
          <h2 className="text-4xl md:text-6xl font-bold mb-8 animate-luxury-slide-up animate-delay-200" style={{fontFamily: 'var(--font-display)'}}>
            <span className="bg-gradient-to-r bg-clip-text text-transparent animate-gradient-shift" style={{
              backgroundImage: `linear-gradient(to right, var(--accent-primary), var(--accent-emphasis), var(--accent-secondary))`,
              backgroundSize: '200% 100%'
            }}>
              {lang === 'zh' ? '预见人生轨迹' : 'Visualize Your Future'}
            </span>
          </h2>

          {/* Subtitle with Typing Effect */}
          <div className="max-w-4xl mx-auto mb-12 animate-luxury-scale-in animate-delay-400">
            <p className="text-xl md:text-2xl leading-relaxed font-light" style={{color: 'var(--text-secondary)'}}>
              {lang === 'zh'
                ? '✨ 融合传统八字智慧与前沿AI技术 • 将您的一生运势转化为震撼的视觉体验'
                : '✨ Combining ancient BaZi wisdom with cutting-edge AI • Transform your lifetime into stunning visuals'
              }
            </p>
            <div className="mt-6 flex items-center justify-center gap-2" style={{color: 'var(--accent-primary)'}}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: 'var(--accent-primary)'}}></div>
              <span className="text-sm font-medium tracking-wider">
                {lang === 'zh' ? '现代科技与古典命理的完美邂逅' : 'Perfect Encounter of Modern Tech & Ancient Wisdom'}
              </span>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{animationDelay: '0.5s', backgroundColor: 'var(--accent-primary)'}}></div>
            </div>
          </div>
        </div>

        {/* Premium CTA Section */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-24 animate-luxury-slide-up animate-delay-600">
          <button
            onClick={onGetStarted}
            className="btn-luxury group text-lg px-12 py-6 rounded-2xl animate-luxury-glow flex items-center gap-3"
          >
            <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span className="font-semibold">
              {lang === 'zh' ? '开启命运之旅' : 'Begin Your Journey'}
            </span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </button>

          <div className="text-sm flex items-center gap-2" style={{color: 'var(--text-muted)'}}>
            <div className="w-1 h-1 rounded-full animate-pulse" style={{backgroundColor: 'var(--accent-primary)'}}></div>
            <span>{lang === 'zh' ? '免费体验 • 3分钟内获得专业报告' : 'Free Experience • Professional Report in 3 Minutes'}</span>
            <div className="w-1 h-1 rounded-full animate-pulse" style={{animationDelay: '1s', backgroundColor: 'var(--accent-primary)'}}></div>
          </div>
        </div>

        {/* Interactive Demo Preview */}
        <div className="relative max-w-5xl mx-auto">
          <div className="glass-card-light p-8 animate-luxury-scale-in animate-delay-700">
            {/* Window Chrome */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="ml-4 text-xs text-gray-400 font-mono bg-gray-800/50 px-3 py-1 rounded-full">
                app.lifekline.ai
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400 font-medium">AI分析中</span>
              </div>
            </div>
            
            {/* Demo Content */}
            <div className="relative">
              <img
                src="/doc/k-line-light.png"
                alt="K-Line Chart Demo"
                className="w-full h-auto rounded-xl shadow-2xl"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  // Show enhanced fallback demo
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              
              {/* Fallback Demo */}
              <div className="hidden space-y-4 p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-yellow-400">命运分析报告</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-400">实时分析</span>
                  </div>
                </div>
                <div className="h-64 bg-gradient-to-br from-yellow-900/20 to-amber-900/20 rounded-xl border border-yellow-400/20 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-300">K线图预览</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative max-w-7xl mx-auto px-4 py-24">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="glass-card-light inline-block px-8 py-4 mb-8 animate-luxury-scale-in">
            <h3 className="text-3xl md:text-4xl font-bold luxury-heading mb-2">
              {lang === 'zh' ? '核心功能' : 'Core Features'}
            </h3>
            <p className="text-gray-400 text-lg">
              {lang === 'zh' ? '现代科技与古典智慧的完美融合' : 'Perfect Fusion of Modern Tech & Ancient Wisdom'}
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card-luxury group animate-luxury-scale-in"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              {/* Icon Container */}
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300" style={{
                  background: `linear-gradient(135deg, var(--accent-primary), var(--accent-emphasis))`
                }}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-2xl opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-300" style={{
                  background: `linear-gradient(135deg, var(--accent-primary), var(--accent-emphasis))`
                }}></div>
              </div>

              {/* Content */}
              <div>
                <h4 className="text-xl font-bold mb-3 transition-colors" style={{
                  color: 'var(--accent-primary)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600
                }}>
                  {lang === 'zh' ? feature.titleZh : feature.titleEn}
                </h4>
                <p className="leading-relaxed transition-colors" style={{color: 'var(--text-secondary)'}}>
                  {lang === 'zh' ? feature.descZh : feature.descEn}
                </p>
              </div>

              {/* Hover Decoration */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor: 'var(--accent-glow)'}}>
                  <Sparkles className="w-4 h-4" style={{color: 'var(--accent-primary)'}} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className="relative max-w-5xl mx-auto px-4 py-24">
        <div className="glass-card-light p-12 text-center relative overflow-hidden animate-luxury-scale-in">
          {/* Background Decoration */}
          <div className="absolute inset-0 animate-gradient-shift" style={{
            background: `linear-gradient(to right, var(--accent-glow), transparent, var(--accent-glow))`,
            backgroundSize: '200% 100%'
          }}></div>
          <div className="absolute top-0 left-0 w-full h-1" style={{
            background: `linear-gradient(to right, transparent, var(--accent-primary), transparent)`
          }}></div>
          <div className="absolute bottom-0 left-0 w-full h-1" style={{
            background: `linear-gradient(to right, transparent, var(--accent-primary), transparent)`
          }}></div>

          {/* Content */}
          <div className="relative">
            {/* Floating Icons */}
            <div className="absolute -top-10 -left-10 animate-float" style={{animationDelay: '1s', opacity: 0.3}}>
              <Crown className="w-12 h-12" style={{color: 'var(--accent-secondary)'}} />
            </div>
            <div className="absolute -top-10 -right-10 animate-float" style={{animationDelay: '2s', opacity: 0.3}}>
              <Gem className="w-10 h-10" style={{color: 'var(--accent-emphasis)'}} />
            </div>

            {/* Main Content */}
            <div className="mb-8">
              <h3 className="text-4xl md:text-5xl font-bold luxury-heading mb-4">
                {lang === 'zh' ? '开启您的命运之旅' : 'Start Your Journey'}
              </h3>
              <p className="text-xl mb-8 leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                {lang === 'zh'
                  ? '✨ 只需几分钟，即可获得AI驱动的专业命运分析报告'
                  : '✨ Get your professional AI-powered destiny analysis in minutes'
                }
              </p>

              {/* Stats */}
              <div className="flex justify-center gap-8 mb-8 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{color: 'var(--accent-primary)'}}>98%</div>
                  <div style={{color: 'var(--text-muted)'}}>{lang === 'zh' ? '准确率' : 'Accuracy'}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{color: 'var(--accent-primary)'}}>3min</div>
                  <div style={{color: 'var(--text-muted)'}}>{lang === 'zh' ? '快速分析' : 'Quick Analysis'}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{color: 'var(--accent-primary)'}}>100%</div>
                  <div style={{color: 'var(--text-muted)'}}>{lang === 'zh' ? '免费' : 'Free'}</div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={onGetStarted}
              className="btn-luxury group text-xl px-16 py-6 animate-luxury-glow flex items-center gap-3 mx-auto"
            >
              <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              <span className="font-bold">
                {lang === 'zh' ? '立即开始分析' : 'Start Analysis Now'}
              </span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>

            {/* Trust Indicators */}
            <div className="mt-8 flex items-center justify-center gap-6 text-sm" style={{color: 'var(--text-muted)'}}>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>{lang === 'zh' ? '隐私安全' : 'Privacy Secured'}</span>
              </div>
              <div className="w-1 h-1 rounded-full" style={{backgroundColor: 'var(--text-muted)'}}></div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span>{lang === 'zh' ? '专业可信' : 'Professional'}</span>
              </div>
              <div className="w-1 h-1 rounded-full" style={{backgroundColor: 'var(--text-muted)'}}></div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>{lang === 'zh' ? '即时结果' : 'Instant Results'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="relative max-w-6xl mx-auto px-4 pb-16 text-center">
        <div className="glass-card inline-block px-8 py-4 animate-luxury-fade-in">
          <p className="text-sm" style={{color: 'var(--text-muted)'}}>
            {lang === 'zh'
              ? '本项目仅供娱乐和文化研究使用 • 开源项目 • MIT License'
              : 'For entertainment and cultural research only • Open Source • MIT License'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
