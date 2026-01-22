import React from 'react';
import { BaZiChart, Language } from '../types';
import { Sparkles, Star } from 'lucide-react';
import { getTexts } from '../locales';

interface BaZiDisplayProps {
  bazi: BaZiChart;
  mainAttribute: string;
  lang: Language;
}

const PillarCard = ({ title, gan, zhi, delay }: { title: string; gan: string; zhi: string; delay?: string }) => (
  <div className="group relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="relative flex flex-col items-center glass-card p-5 min-w-[100px] animate-luxury-scale-in" style={delay ? { animationDelay: delay } : {}}>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
      </div>
      <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-widest">{title}</span>
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <span className="text-4xl font-bold text-gray-800 dark:text-gray-700 group-hover:scale-110 transition-transform duration-300">{gan}</span>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
        <div className="relative">
          <span className="text-4xl font-bold text-gray-800 dark:text-gray-700 group-hover:scale-110 transition-transform duration-300">{zhi}</span>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
    </div>
  </div>
);

const BaZiDisplay: React.FC<BaZiDisplayProps> = ({ bazi, mainAttribute, lang }) => {
  const t = getTexts(lang);
  return (
    <div className="glass-card-light p-8 mb-8 animate-luxury-fade-in relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-yellow-300/10 animate-gradient-shift"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
      
      <div className="relative">
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg animate-luxury-glow">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl opacity-20 blur-xl animate-pulse"></div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-2xl font-bold luxury-heading">{t.baziTitle}</h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{lang === 'zh' ? '四柱八字命盘' : 'Four Pillars of Destiny'}</p>
          </div>
          
          <div className="relative">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-sm font-bold rounded-full shadow-lg">
              <Sparkles className="w-4 h-4" />
              {mainAttribute}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full opacity-30 blur-lg animate-pulse"></div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <PillarCard title={t.year} gan={bazi.year.gan} zhi={bazi.year.zhi} delay="0.1s" />
          <PillarCard title={t.month} gan={bazi.month.gan} zhi={bazi.month.zhi} delay="0.2s" />
          <PillarCard title={t.day} gan={bazi.day.gan} zhi={bazi.day.zhi} delay="0.3s" />
          <PillarCard title={t.hour} gan={bazi.hour.gan} zhi={bazi.hour.zhi} delay="0.4s" />
        </div>
      </div>
    </div>
  );
};

export default BaZiDisplay;