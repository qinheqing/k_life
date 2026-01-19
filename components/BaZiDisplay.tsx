import React from 'react';
import { BaZiChart, Language } from '../types';
import { getTexts } from '../locales';

interface BaZiDisplayProps {
  bazi: BaZiChart;
  mainAttribute: string;
  lang: Language;
}

const PillarCard = ({ title, gan, zhi }: { title: string; gan: string; zhi: string }) => (
  <div className="flex flex-col items-center bg-purple-50 dark:bg-orange-100 rounded-xl p-4 border border-purple-100 dark:border-amber-300 min-w-[80px] transition-colors duration-200">
    <span className="text-xs text-purple-600 dark:text-orange-700 font-medium mb-2 uppercase tracking-wide">{title}</span>
    <div className="flex flex-col items-center gap-1">
      <span className="text-3xl font-bold text-slate-800 dark:text-gray-800 serif">{gan}</span>
      <span className="text-3xl font-bold text-slate-800 dark:text-gray-800 serif">{zhi}</span>
    </div>
  </div>
);

const BaZiDisplay: React.FC<BaZiDisplayProps> = ({ bazi, mainAttribute, lang }) => {
  const t = getTexts(lang);
  return (
    <div className="bg-white dark:bg-amber-50 rounded-2xl shadow-sm border border-gray-100 dark:border-amber-200 p-6 mb-8 transition-colors duration-200">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-6 w-1 bg-purple-600 dark:bg-orange-500 rounded-full transition-colors duration-200"></div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-gray-800 transition-colors duration-200">{t.baziTitle}</h3>
        <span className="ml-auto px-3 py-1 bg-purple-100 dark:bg-orange-200 text-purple-700 dark:text-orange-800 text-xs font-bold rounded-full uppercase transition-colors duration-200">
          {mainAttribute}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <PillarCard title={t.year} gan={bazi.year.gan} zhi={bazi.year.zhi} />
        <PillarCard title={t.month} gan={bazi.month.gan} zhi={bazi.month.zhi} />
        <PillarCard title={t.day} gan={bazi.day.gan} zhi={bazi.day.zhi} />
        <PillarCard title={t.hour} gan={bazi.hour.gan} zhi={bazi.hour.zhi} />
      </div>
    </div>
  );
};

export default BaZiDisplay;