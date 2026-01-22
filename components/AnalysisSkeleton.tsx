import React from 'react';
import { Language } from '../types';
import { getTexts } from '../locales';

interface AnalysisSkeletonProps {
  lang: Language;
  theme: 'light' | 'dark';
}

const AnalysisSkeleton: React.FC<AnalysisSkeletonProps> = ({ lang, theme }) => {
  const t = getTexts(lang);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="p-6 rounded-2xl border bg-white dark:bg-amber-50 shadow-sm border-gray-100 dark:border-amber-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="skeleton w-5 h-5 rounded"></div>
            <div className="skeleton-title w-48"></div>
          </div>
          <div className="skeleton-text w-24"></div>
        </div>
        <div className="skeleton-text w-full mb-4"></div>
        <div className="skeleton-card w-full h-12"></div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={`p-6 rounded-2xl border bg-white dark:bg-amber-50 shadow-sm border-gray-100 dark:border-amber-200 animate-fade-in-up`} style={{ animationDelay: `${i * 75}ms` }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="skeleton w-10 h-10 rounded-lg"></div>
                <div className="skeleton-title w-32"></div>
              </div>
              <div className="skeleton w-6 h-6 rounded-full"></div>
            </div>
            <div className="space-y-3">
              <div className="skeleton-text w-full"></div>
              <div className="skeleton-text w-5/6"></div>
              <div className="skeleton-card w-full h-16 mt-4"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-8 rounded-2xl bg-white dark:bg-amber-50 shadow-sm border border-gray-100 dark:border-amber-200">
        <div className="flex items-center gap-2 mb-6">
          <div className="skeleton w-6 h-6 rounded"></div>
          <div className="skeleton-title w-64"></div>
        </div>
        <div className="space-y-4 max-h-[600px] overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex gap-4 p-3 rounded-lg animate-fade-in-up" style={{ animationDelay: `${i * 75}ms` }}>
              <div className="flex-shrink-0 w-16">
                <div className="skeleton-title w-full text-center"></div>
                <div className="skeleton-text w-full mt-1"></div>
              </div>
              <div className="flex-1 flex items-center gap-2">
                <div className="skeleton w-2 h-2 rounded-full"></div>
                <div className="skeleton-text w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisSkeleton;
