import React, { useState } from 'react';
import { X, Sparkles, MapPin, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Language } from '../types';
import { getTexts } from '../locales';

interface OnboardingTipsProps {
  lang: Language;
  onClose: () => void;
}

const OnboardingTips: React.FC<OnboardingTipsProps> = ({ lang, onClose }) => {
  const [currentTip, setCurrentTip] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const tipsZh = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "准备好您的出生信息",
      content: "请提前准备好您的出生日期、时间、地点。时间要准确到小时，地点要具体到城市，这样才能计算准确的三柱八字。",
      color: "from-purple-500 to-indigo-500"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "出生地很重要",
      content: "系统会根据您的出生地计算真太阳时，不同经纬度的真太阳时差异可达2小时以上，直接影响到时辰的判定。",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "出生时间要准确",
      content: "如果您不确定具体时间，尽量使用最接近的时间（整点或半点）。时辰不同，八字四柱就会发生变化，影响分析结果。",
      color: "from-orange-500 to-amber-500"
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      title: "八字确认后才能分析",
      content: "系统计算出八字后，您可以查看并手动调整。确认无误后，AI才会生成完整的命运分析和100年K线图。",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "分析需要等待",
      content: "AI生成完整的命运分析需要约1-3分钟，请耐心等待。分析过程中系统会显示命理小知识，您可以学习了解。",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const tipsEn = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Prepare Your Birth Information",
      content: "Please have your birth date, time, and location ready. Time should be accurate to the hour, and location should be specific to the city for accurate BaZi calculation.",
      color: "from-purple-500 to-indigo-500"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Birthplace Matters",
      content: "The system calculates True Solar Time based on your birthplace. Different longitudes can result in 2+ hour differences, directly affecting the Hour Pillar.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Accurate Birth Time",
      content: "If unsure, use the closest time (whole or half hour). Different Hour Pillars change your entire BaZi chart and affect analysis results.",
      color: "from-orange-500 to-amber-500"
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      title: "Confirm Before Analysis",
      content: "After calculation, you can review and manually adjust the BaZi chart. AI will only generate the full analysis after your confirmation.",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Wait for Analysis",
      content: "AI generation takes approximately 1-3 minutes. During this time, you can read BaZi tips and learn more about traditional numerology.",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const tips = lang === 'zh' ? tipsZh : tipsEn;

  if (dismissed) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full animate-fade-in-up">
      <div className="bg-white dark:bg-white rounded-2xl shadow-2xl border border-gray-100 dark:border-amber-200 overflow-hidden">
        <div className={`bg-gradient-to-r ${tips[currentTip].color} p-4`}>
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              {tips[currentTip].icon}
              <span className="font-bold">
                {lang === 'zh' ? '使用提示' : 'Tips'} {currentTip + 1}/{tips.length}
              </span>
            </div>
            <button
              onClick={() => {
                setDismissed(true);
                onClose();
              }}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-800 mb-3">
            {tips[currentTip].title}
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-700 leading-relaxed mb-4">
            {tips[currentTip].content}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {tips.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentTip(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentTip
                      ? 'w-6 bg-purple-600 dark:bg-orange-600'
                      : 'bg-gray-300 dark:bg-gray-400 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                  aria-label={`Tip ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentTip((prev) => Math.max(0, prev - 1))}
                disabled={currentTip === 0}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-amber-100 text-gray-700 dark:text-gray-800 hover:bg-gray-200 dark:hover:bg-amber-200"
              >
                {lang === 'zh' ? '上一个' : 'Previous'}
              </button>
              {currentTip === tips.length - 1 ? (
                <button
                  onClick={() => {
                    setDismissed(true);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-orange-500 dark:to-amber-500 text-white hover:opacity-90 transition-opacity"
                >
                  {lang === 'zh' ? '开始' : 'Start'}
                </button>
              ) : (
                <button
                  onClick={() => setCurrentTip((prev) => Math.min(tips.length - 1, prev + 1))}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-orange-500 dark:to-amber-500 text-white hover:opacity-90 transition-opacity"
                >
                  {lang === 'zh' ? '下一个' : 'Next'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTips;
