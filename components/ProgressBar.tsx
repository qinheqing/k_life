import React, { useEffect, useState } from 'react';
import { Clock, Loader2 } from 'lucide-react';
import { Language } from '../types';
import { getTexts } from '../locales';

interface ProgressBarProps {
  progress: number;
  step: string;
  estimatedTime?: number;
  lang: Language;
  theme: 'light' | 'dark';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  step, 
  estimatedTime, 
  lang,
  theme 
}) => {
  const t = getTexts(lang);
  const [displayTime, setDisplayTime] = useState<number | null>(estimatedTime || null);

  useEffect(() => {
    setDisplayTime(estimatedTime || null);
  }, [estimatedTime]);

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
    <div className={`fixed bottom-0 left-0 right-0 ${bgClass} border-t px-4 py-3 z-50 shadow-lg transition-colors duration-200`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3 flex-1">
            <Loader2 className="w-5 h-5 animate-spin text-purple-500 dark:text-orange-500" />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${textClass} truncate`}>{step}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {displayTime !== null && (
              <div className={`flex items-center gap-1 ${textClass} bg-gray-100 dark:bg-amber-100 px-3 py-1 rounded-full`}>
                <Clock className="w-4 h-4" />
                <span className="font-medium">
                  {lang === 'zh' ? '预计还需 ' : 'Est. '}
                  {formatTime(displayTime)}
                </span>
              </div>
            )}
            <span className={`font-bold ${textClass} min-w-[3rem] text-right`}>
              {progress}%
            </span>
          </div>
        </div>

        <div className={`w-full h-2 ${barBg} rounded-full overflow-hidden`}>
          <div 
            className={`h-full ${barFill} transition-all duration-300 ease-out rounded-full`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
