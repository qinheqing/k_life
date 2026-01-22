import React, { useState, useEffect } from 'react';
import { Lightbulb, Sparkles, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Language } from '../types';
import { getTexts } from '../locales';

interface LoadingContentProps {
  lang: Language;
  theme: 'light' | 'dark';
}

const LoadingContent: React.FC<LoadingContentProps> = ({ lang, theme }) => {
  const t = getTexts(lang);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const tipsZh = [
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "什么是真太阳时？",
      content: "真太阳时是根据太阳在天空中的实际位置计算的时间，比标准时钟时间更能准确反映出生时刻的天文意义，是八字排盘的关键依据。"
    },
    {
      icon: <Lightbulb className="w-5 h-5" />,
      title: "八字四柱的含义",
      content: "年柱代表祖业和早年运势，月柱代表事业和同辈关系，日柱代表自己和配偶，时柱代表子女和晚年运势。"
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "什么是大运？",
      content: "大运是人生每十年的运势周期，大运交替时往往会有明显的人生转折，比如换工作、结婚、搬迁等重大变化。"
    },
    {
      icon: <Lightbulb className="w-5 h-5" />,
      title: "命主强弱的重要性",
      content: "命强者喜泄耗（财官食伤），命弱者喜印比（印枭比劫），这是判断喜用神的基础，直接关系到运势分析的方向。"
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "为什么需要地理位置？",
      content: "不同经纬度的真太阳时差异可达2小时以上，准确计算真太阳时才能确定正确的时辰，避免排盘错误。"
    },
    {
      icon: <Lightbulb className="w-5 h-5" />,
      title: "K线图的含义",
      content: "绿色K线代表运势上升（牛市），红色K线代表运势下降（熊市），关键年份会有详细的事业、财富、健康分析。"
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "风水与五行",
      content: "根据喜用五行选择有利方位、颜色、职业，可以顺势而为，提升运势，改善人生质量。"
    },
    {
      icon: <Lightbulb className="w-5 h-5" />,
      title: "婚姻命理分析",
      content: "通过日支和十神分析配偶性格、适婚年龄、婚姻质量，帮助你做出更好的情感选择。"
    }
  ];

  const tipsEn = [
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "What is True Solar Time?",
      content: "True Solar Time is calculated based on sun's actual position in sky. It's more accurate for birth timing than standard time and is crucial for BaZi charting."
    },
    {
      icon: <Lightbulb className="w-5 h-5" />,
      title: "Meaning of Four Pillars",
      content: "Year Pillar represents ancestors and early life, Month Pillar for career and peers, Day Pillar for self and spouse, Hour Pillar for children and late life."
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "What is Da Yun (Big Luck)?",
      content: "Da Yun represents 10-year luck cycles. During Da Yun transitions, significant life changes often occur such as career changes, marriage, or relocation."
    },
    {
      icon: <Lightbulb className="w-5 h-5" />,
      title: "Day Master Strength",
      content: "Strong Day Masters prefer Output and Wealth/Official, Weak Day Masters prefer Resource and Parallel. This determines favorable elements for your fortune."
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "Why Location Matters?",
      content: "True Solar Time can differ by 2+ hours based on longitude. Accurate solar time ensures correct Hour Pillar calculation, avoiding charting errors."
    },
    {
      icon: <Lightbulb className="w-5 h-5" />,
      title: "K-Line Chart Meaning",
      content: "Green K-lines represent rising luck (bull market), red K-lines represent falling luck (bear market). Key years include detailed career, wealth, and health analysis."
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "Feng Shui & Five Elements",
      content: "Choosing favorable directions, colors, and careers based on beneficial elements helps you align with natural forces and improve life quality."
    },
    {
      icon: <Lightbulb className="w-5 h-5" />,
      title: "Marriage Analysis",
      content: "Analyze spouse characteristics, ideal marriage age, and relationship quality through Day Branch and Ten Gods, helping you make better emotional choices."
    }
  ];

  const tips = lang === 'zh' ? tipsZh : tipsEn;

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % tips.length);
        setIsAnimating(false);
      }, 300);
    }, 8000);

    return () => clearInterval(interval);
  }, [tips.length]);

  const nextTip = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % tips.length);
      setIsAnimating(false);
    }, 300);
  };

  const prevTip = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + tips.length) % tips.length);
      setIsAnimating(false);
    }, 300);
  };

  const currentTip = tips[currentIndex];

  return (
    <div className={`max-w-lg mx-auto mt-12 mb-8 ${isAnimating ? 'opacity-60 scale-95' : 'opacity-100 scale-100'} transition-all duration-500`}>
      <div className="glass-card-light p-8 relative overflow-hidden progressive-reveal">
        {/* AI思考动态背景 */}
        <div className="absolute inset-0 animate-gradient-shift" style={{
          background: `linear-gradient(145deg, var(--accent-glow), transparent, var(--accent-glow))`,
          backgroundSize: '200% 200%'
        }}></div>
        <div className="absolute top-0 left-0 w-full h-1" style={{
          background: `linear-gradient(to right, transparent, var(--accent-primary), transparent)`
        }}></div>

        <div className="relative">
          {/* AI思考状态提示 */}
          <div className="flex items-center gap-3 mb-6 slide-in-content" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{
              background: `linear-gradient(135deg, var(--accent-primary), var(--accent-emphasis))`,
              boxShadow: '0 0 20px var(--accent-glow)'
            }}>
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
              <span className="text-white text-sm font-semibold typing-cursor">
                {lang === 'zh' ? 'AI 正在深度分析' : 'AI Deep Analysis'}
              </span>
            </div>
            {/* 动态加载点 */}
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full animate-bounce" style={{
                backgroundColor: 'var(--accent-primary)',
                animationDelay: '0s'
              }}></span>
              <span className="w-2 h-2 rounded-full animate-bounce" style={{
                backgroundColor: 'var(--accent-primary)',
                animationDelay: '0.2s'
              }}></span>
              <span className="w-2 h-2 rounded-full animate-bounce" style={{
                backgroundColor: 'var(--accent-primary)',
                animationDelay: '0.4s'
              }}></span>
            </div>
          </div>

          <div className="flex items-start gap-5 mb-6 progressive-reveal-fast" style={{animationDelay: '0.2s'}}>
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg animate-luxury-glow" style={{
                background: `linear-gradient(135deg, var(--accent-primary), var(--accent-emphasis))`
              }}>
                <div className="text-white">
                  {currentTip.icon}
                </div>
              </div>
              <div className="absolute inset-0 rounded-2xl opacity-20 blur-xl animate-pulse" style={{
                background: `linear-gradient(135deg, var(--accent-primary), var(--accent-emphasis))`
              }}></div>
              <div className="absolute -top-2 -right-2">
                <Star className="w-6 h-6 animate-pulse" style={{color: 'var(--accent-emphasis)', fill: 'var(--accent-emphasis)'}} />
              </div>
            </div>

            <div className="flex-1">
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 text-white text-xs font-bold rounded-full" style={{
                background: `linear-gradient(to right, var(--accent-primary), var(--accent-emphasis))`
              }}>
                <Sparkles className="w-3 h-3" />
                {lang === 'zh' ? '命理小知识' : 'Did You Know?'}
              </div>

              <h4 className={`font-bold text-lg mb-3 luxury-heading`} style={{color: 'var(--text-primary)'}}>
                {currentTip.title}
              </h4>

              <p className={`text-sm leading-relaxed`} style={{color: 'var(--text-secondary)'}}>
                {currentTip.content}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 progressive-reveal-fast" style={{
            borderTop: `1px solid var(--border-subtle)`,
            animationDelay: '0.3s'
          }}>
            <div className="flex items-center gap-2">
              {tips.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsAnimating(true);
                    setTimeout(() => {
                      setCurrentIndex(idx);
                      setIsAnimating(false);
                    }, 300);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? 'w-8 shadow-lg'
                      : 'w-2 hover:w-4'
                  }`}
                  style={{
                    backgroundColor: idx === currentIndex ? 'var(--accent-primary)' : 'var(--border-medium)'
                  }}
                  aria-label={`Tip ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="text-xs font-medium" style={{color: 'var(--text-muted)'}}>
                {currentIndex + 1} / {tips.length}
              </div>

              <div className="flex gap-2 ml-2">
                <button
                  onClick={prevTip}
                  className="p-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)'
                  }}
                  aria-label="Previous tip"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextTip}
                  className="p-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)'
                  }}
                  aria-label="Next tip"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingContent;
