import React, { useEffect, useState } from 'react';
import { Clock, Loader2, CheckCircle, Brain, Globe, Briefcase, Compass, Gem, Heart, Calendar, Zap } from 'lucide-react';
import { Language } from '../types';
import { getTexts } from '../locales';

interface ProgressBarProps {
  progress: number;
  step: string;
  estimatedTime?: number;
  lang: Language;
  theme: 'light' | 'dark';
}

interface Stage {
  id: string;
  icon: any;
  labelZh: string;
  labelEn: string;
  threshold: number;
}

const stages: Stage[] = [
  { id: 'basic', icon: Brain, labelZh: '基础分析', labelEn: 'Basic', threshold: 10 },
  { id: 'extended', icon: Brain, labelZh: '扩展分析', labelEn: 'Extended', threshold: 20 },
  { id: 'personality-local', icon: Brain, labelZh: '性格本地', labelEn: 'Personality', threshold: 30 },
  { id: 'main-attr', icon: Zap, labelZh: '命主总述', labelEn: 'Overview', threshold: 40 },
  { id: 'geographic', icon: Globe, labelZh: '地理发展', labelEn: 'Location', threshold: 50 },
  { id: 'personality-ai', icon: Brain, labelZh: '性格分析', labelEn: 'Personality', threshold: 60 },
  { id: 'career', icon: Briefcase, labelZh: '事业分析', labelEn: 'Career', threshold: 70 },
  { id: 'fengshui', icon: Compass, labelZh: '风水分析', labelEn: 'Feng Shui', threshold: 80 },
  { id: 'wealth', icon: Gem, labelZh: '财富分析', labelEn: 'Wealth', threshold: 90 },
  { id: 'marriage', icon: Heart, labelZh: '婚姻分析', labelEn: 'Marriage', threshold: 95 },
  { id: 'timeline', icon: Calendar, labelZh: 'K线生成', labelEn: 'Timeline', threshold: 100 },
];

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  step, 
  estimatedTime, 
  lang,
  theme 
}) => {
  const t = getTexts(lang);
  const [displayTime, setDisplayTime] = useState<number | null>(estimatedTime || null);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    setDisplayTime(estimatedTime || null);
  }, [estimatedTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedProgress(prev => {
        if (Math.abs(progress - prev) < 0.5) {
          return progress;
        }
        return prev + (progress - prev) * 0.1;
      });
    }, 16);
    return () => clearInterval(interval);
  }, [progress]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return lang === 'zh' ? `${seconds}秒` : `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (lang === 'zh') {
      return remainingSeconds > 0 ? `${minutes}分${remainingSeconds}秒` : `${minutes}分`;
    }
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const bgClass = theme === 'dark' 
    ? 'bg-amber-50 border-amber-200' 
    : 'bg-white border-gray-200';
  const textClass = theme === 'dark' 
    ? 'text-gray-800' 
    : 'text-gray-900';
  const barBg = theme === 'dark' 
    ? 'bg-gray-200' 
    : 'bg-gray-100';
  const barFill = 'bg-gradient-to-r from-purple-500 to-indigo-500 dark:from-orange-500 dark:to-amber-500';

  return (
    <div className={`fixed bottom-0 left-0 right-0 ${bgClass} border-t px-3 py-2 z-50 shadow-lg transition-colors duration-200`}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-1">
            <Loader2 className="w-4 h-4 animate-spin text-purple-500 dark:text-orange-500" />
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-medium ${textClass} truncate`}>{step}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {displayTime !== null && (
              <div className={`flex items-center gap-1 ${textClass} bg-gray-100 dark:bg-amber-100 px-2 py-0.5 rounded-full`}>
                <Clock className="w-3 h-3" />
                <span className="font-medium">
                  {lang === 'zh' ? `${formatTime(displayTime)}` : `${formatTime(displayTime)}`}
                </span>
              </div>
            )}
            <span className={`font-bold ${textClass} min-w-[2.5rem] text-right`}>
              {Math.round(animatedProgress)}%
            </span>
          </div>
        </div>

        <div className={`w-full h-1.5 ${barBg} rounded-full overflow-hidden mb-2`}>
          <div 
            className={`h-full ${barFill} transition-all duration-100 ease-out rounded-full relative`}
            style={{ width: `${Math.min(100, Math.max(0, animatedProgress))}%` }}
          >
            <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-white/30 animate-pulse" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-0.5 overflow-x-auto pb-0.5">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isCompleted = animatedProgress >= stage.threshold;
            const isCurrent = animatedProgress >= stage.threshold - 5 && animatedProgress < stage.threshold + 5;
            const isUpcoming = animatedProgress < stage.threshold - 5;

            return (
              <div
                key={stage.id}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-all duration-300 flex-shrink-0 ${
                  isCompleted 
                    ? 'bg-purple-100 dark:bg-orange-200' 
                    : isCurrent
                      ? 'bg-purple-200 dark:bg-orange-300'
                      : 'bg-gray-100 dark:bg-amber-100 opacity-60'
                }`}
                title={lang === 'zh' ? stage.labelZh : stage.labelEn}
              >
                {isCompleted ? (
                  <CheckCircle className="w-3 h-3 text-purple-600 dark:text-orange-600 flex-shrink-0" />
                ) : (
                  <Icon className={`w-3 h-3 flex-shrink-0 ${isCurrent ? 'text-purple-600 dark:text-orange-600 animate-pulse' : 'text-gray-400 dark:text-gray-500'}`} />
                )}
                <span className={`text-[10px] font-medium ${
                  isCompleted 
                    ? 'text-purple-700 dark:text-orange-700' 
                    : isCurrent
                      ? 'text-purple-800 dark:text-orange-800'
                      : 'text-gray-500 dark:text-gray-600'
                }`}>
                  {lang === 'zh' ? stage.labelZh : stage.labelEn}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
