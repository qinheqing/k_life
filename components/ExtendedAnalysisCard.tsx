import React, { useState } from 'react';
import { Language } from '../types';
import { Briefcase, Gem, Heart, Compass, Activity, GraduationCap, MapPin, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface ExtendedAnalysisCardProps {
  data: any;
  lang: Language;
  theme: 'light' | 'dark';
}

const RatingBar = ({ rating }: { rating: number }) => {
  return (
    <div className="w-full bg-gray-100 dark:bg-amber-200 rounded-full h-3 overflow-hidden shadow-inner">
      <div
        className={`h-full rounded-full transition-all duration-700 ${
          rating >= 8 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
          rating >= 5 ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
          'bg-gradient-to-r from-orange-400 to-red-500'
        }`}
        style={{ width: `${rating * 10}%` }}
      ></div>
    </div>
  );
};

const ExpandableSection = ({ title, icon: Icon, data, lang, children, defaultExpanded = false, delay = 0 }: any) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="glass-card hover:shadow-xl transition-all duration-300 relative progressive-reveal-fast" style={{animationDelay: `${delay}s`}}>
      <div className="relative overflow-hidden rounded-2xl">
        <div
          className="p-5 border-b border-gray-100 dark:border-amber-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-amber-50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 dark:from-yellow-400 dark:to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-500 dark:from-yellow-400 dark:to-orange-500 rounded-xl opacity-20 blur-xl"></div>
              </div>
              <h3 className="font-bold text-lg text-gray-800 dark:text-gray-700">{title}</h3>
              <span className="ml-2 px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 dark:from-yellow-500 dark:to-orange-500 text-white text-xs font-bold rounded-full shadow-md">
                {data.score || data.level}/{data.maxScore || 10}
              </span>
            </div>
            <button className="p-2 rounded-lg transition-all duration-300 bg-gray-100 dark:bg-amber-100 hover:bg-purple-100 dark:hover:bg-orange-200">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-600" />
              )}
            </button>
          </div>
          {data.summary && (
            <p className="text-sm text-gray-600 dark:text-gray-700 mt-3 ml-13 leading-relaxed">{data.summary}</p>
          )}
        </div>

        {isExpanded && (
          <div className="p-5 bg-white dark:bg-amber-50 animate-fade-in">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

const ExtendedAnalysisCard: React.FC<ExtendedAnalysisCardProps> = ({ data, lang }) => {
  const zh = lang === 'zh';

  return (
    <div className="decoration-container decoration-container--purple glass-card-light p-8 progressive-reveal">
      <div className="decoration-container-content">
        <div className="flex items-center gap-3 mb-8 slide-in-content" style={{animationDelay: '0.1s'}}>
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 dark:from-yellow-400 dark:to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 dark:from-yellow-400 dark:to-orange-500 rounded-xl opacity-20 blur-xl animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-bold luxury-heading">{zh ? '扩展分析' : 'Extended Analysis'}</h2>
        </div>

        <div className="space-y-4">
          {data.careerAnalysis && (
            <ExpandableSection
              title={zh ? '事业分析' : 'Career Analysis'}
              icon={Briefcase}
              data={{ score: data.careerAnalysis.careerScore }}
              lang={lang}
              defaultExpanded={true}
              delay={0.2}
            >
              <div className="space-y-4">
                <div className="glass-card p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-amber-50 dark:to-yellow-50 border border-blue-200 dark:border-amber-200">
                  <p className="text-xs text-gray-500 dark:text-gray-600 mb-2 font-semibold">{zh ? '评分' : 'Rating'}</p>
                  <RatingBar rating={data.careerAnalysis.careerScore} />
                </div>
                <div className="glass-card p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-600 mb-2 font-semibold">{zh ? '详细' : 'Details'}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-800 leading-relaxed">{data.careerAnalysis.careerDetail}</p>
                </div>
                <div className="glass-card p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-600 mb-3 font-semibold">{zh ? '适合行业' : 'Suitable Sectors'}</p>
                  <div className="flex flex-wrap gap-2">
                    {data.careerAnalysis.recommendedSectors?.map((item: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-200 dark:to-indigo-200 text-blue-700 dark:text-blue-800 rounded-lg text-sm font-medium hover:scale-105 transition-transform">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="glass-card p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-600 mb-3 font-semibold">{zh ? '适合职位' : 'Suitable Jobs'}</p>
                  <div className="flex flex-wrap gap-2">
                    {data.careerAnalysis.suitableJobs?.map((item: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 glass-card border border-blue-200 dark:border-blue-300 text-gray-700 dark:text-gray-800 rounded-lg text-sm hover:scale-105 hover:shadow-md transition-all">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </ExpandableSection>
          )}
 
          {data.wealthAnalysis && (
            <ExpandableSection
              title={zh ? '财富分析' : 'Wealth Analysis'}
              icon={Gem}
              data={{ score: data.wealthAnalysis.wealthLevel }}
              lang={lang}
              defaultExpanded={true}
              delay={0.3}
            >
              <div className="space-y-4">
                <div className="glass-card p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-amber-50 dark:to-yellow-50 border border-green-200 dark:border-amber-200">
                  <p className="text-xs text-gray-500 dark:text-gray-600 mb-2 font-semibold">{zh ? '财富等级' : 'Wealth Level'}</p>
                  <RatingBar rating={data.wealthAnalysis.wealthLevel} />
                </div>
                <div className="glass-card p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-600 mb-2 font-semibold">{zh ? '详细' : 'Details'}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-800 leading-relaxed">{data.wealthAnalysis.wealthDetail}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card p-4 hover:shadow-md transition-shadow">
                    <p className="text-xs text-gray-500 dark:text-gray-600 mb-2 font-semibold">{zh ? '赚钱能力' : 'Earning'}</p>
                    <RatingBar rating={data.wealthAnalysis.earningAbility} />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-800 mt-1 block">{data.wealthAnalysis.earningAbility}</span>
                  </div>
                  <div className="glass-card p-4 hover:shadow-md transition-shadow">
                    <p className="text-xs text-gray-500 dark:text-gray-600 mb-2 font-semibold">{zh ? '投资天赋' : 'Investment'}</p>
                    <RatingBar rating={data.wealthAnalysis.investmentTalent} />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-800 mt-1 block">{data.wealthAnalysis.investmentTalent}</span>
                  </div>
                </div>
                <div className="glass-card p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-amber-100 dark:to-yellow-100 border border-emerald-200 dark:border-amber-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-green-600 dark:text-yellow-700" />
                    <p className="text-xs font-bold text-green-700 dark:text-yellow-800">{zh ? '财运时机' : 'Wealth Timing'}</p>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-800">{data.wealthAnalysis.wealthTiming}</p>
                </div>
              </div>
            </ExpandableSection>
          )}
 
          {data.marriageAnalysis && (
            <ExpandableSection
              title={zh ? '婚姻分析' : 'Marriage Analysis'}
              icon={Heart}
              data={{ score: data.marriageAnalysis.marriageScore }}
              lang={lang}
              defaultExpanded={true}
              delay={0.4}
            >
              <div className="space-y-4">
                <div className="glass-card p-4 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-amber-50 dark:to-yellow-50 border border-pink-200 dark:border-amber-200">
                  <p className="text-xs text-gray-500 dark:text-gray-600 mb-2 font-semibold">{zh ? '婚姻评分' : 'Marriage Score'}</p>
                  <RatingBar rating={data.marriageAnalysis.marriageScore} />
                </div>
                <div className="glass-card p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-600 mb-2 font-semibold">{zh ? '适婚年龄' : 'Best Marriage Age'}</p>
                  <p className="text-lg font-bold text-pink-600 dark:text-pink-700">{data.marriageAnalysis.marriageAge}</p>
                </div>
                <div className="glass-card p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-600 mb-2 font-semibold">{zh ? '配偶特征' : 'Spouse Characteristics'}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-800 leading-relaxed">{data.marriageAnalysis.spouseCharacteristics}</p>
                </div>
                <div className="glass-card p-4 bg-gradient-to-r from-rose-50 to-red-50 dark:from-amber-100 dark:to-yellow-100 border border-rose-200 dark:border-amber-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-rose-600 dark:text-yellow-700" />
                    <p className="text-xs font-bold text-rose-700 dark:text-yellow-800">{zh ? '婚姻建议' : 'Marriage Advice'}</p>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-800 leading-relaxed">{data.marriageAnalysis.marriageDetail}</p>
                </div>
              </div>
            </ExpandableSection>
          )}
 
          {data.fengShuiAdvice && (
            <ExpandableSection
              title={zh ? '风水建议' : 'Feng Shui Advice'}
              icon={Compass}
              data={{ score: 8 }}
              lang={lang}
              defaultExpanded={true}
              delay={0.5}
            >
              <div className="space-y-4">
                <div className="glass-card p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-600 mb-3 font-semibold">{zh ? '吉利颜色' : 'Favorable Colors'}</p>
                  <div className="flex flex-wrap gap-2">
                    {data.fengShuiAdvice.favorableColors?.map((color: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-orange-100 dark:to-yellow-100 text-purple-700 dark:text-orange-800 rounded-lg text-sm font-medium hover:scale-105 transition-transform">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="glass-card p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-600 mb-3 font-semibold">{zh ? '有利方位' : 'Favorable Directions'}</p>
                  <div className="flex flex-wrap gap-2">
                    {data.fengShuiAdvice.favorableDirections?.map((dir: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-200 dark:to-emerald-200 text-green-700 dark:text-green-800 rounded-lg text-sm font-medium hover:scale-105 transition-transform">
                        {dir}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="glass-card p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-600 mb-3 font-semibold">{zh ? '有利五行' : 'Favorable Elements'}</p>
                  <div className="flex flex-wrap gap-2">
                    {data.fengShuiAdvice.favorableElements?.map((elem: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-200 dark:to-indigo-200 text-blue-700 dark:text-blue-800 rounded-lg text-sm font-bold hover:scale-105 transition-transform">
                        {elem}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="glass-card p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-100 dark:to-yellow-100 border border-amber-200 dark:border-yellow-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-yellow-700" />
                    <p className="text-xs font-bold text-amber-700 dark:text-yellow-800">{zh ? '风水详解' : 'Feng Shui Detail'}</p>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-800 leading-relaxed">{data.fengShuiAdvice.fengShuiDetail}</p>
                </div>
              </div>
            </ExpandableSection>
          )}
 
          {data.healthAnalysis && (
            <ExpandableSection
              title={zh ? '健康分析' : 'Health Analysis'}
              icon={Activity}
              data={{ score: data.healthAnalysis.healthLevel }}
              lang={lang}
              defaultExpanded={true}
              delay={0.6}
            >
              <div className="space-y-4">
                <div className="glass-card p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-amber-50 dark:to-yellow-50 border border-red-200 dark:border-amber-200">
                  <p className="text-xs text-gray-500 dark:text-gray-600 mb-2 font-semibold">{zh ? '健康等级' : 'Health Level'}</p>
                  <RatingBar rating={data.healthAnalysis.healthLevel} />
                </div>
                <div className="glass-card p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-600 mb-2 font-semibold">{zh ? '注意事项' : 'Health Tips'}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-800 leading-relaxed">{data.healthAnalysis.healthDetail}</p>
                </div>
                <div className="glass-card p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-amber-100 dark:to-yellow-100 border border-teal-200 dark:border-amber-300">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600 dark:text-yellow-700" />
                    <p className="text-xs font-bold text-teal-700 dark:text-yellow-800">{zh ? '运动建议' : 'Exercise'}</p>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-800 mt-1">{data.healthAnalysis.exerciseRecommendation}</p>
                </div>
              </div>
            </ExpandableSection>
          )}
 
          {data.geographicAnalysis && (
            <ExpandableSection
              title={zh ? '地理分析' : 'Geographic Analysis'}
              icon={MapPin}
              data={{ score: 8 }}
              lang={lang}
              defaultExpanded={true}
              delay={0.7}
            >
              <div className="space-y-4">
                <div className="glass-card p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-600 mb-3 font-semibold">{zh ? '推荐省份' : 'Recommended Provinces'}</p>
                  <div className="flex flex-wrap gap-2">
                    {data.geographicAnalysis.favorableProvinces?.map((prov: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-200 dark:to-teal-200 text-emerald-700 dark:text-emerald-800 rounded-lg text-sm font-medium hover:scale-105 transition-transform">
                        {prov}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="glass-card p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-600 mb-3 font-semibold">{zh ? '推荐城市' : 'Recommended Cities'}</p>
                  <div className="flex flex-wrap gap-2">
                    {data.geographicAnalysis.favorableCities?.map((city: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 glass-card border border-emerald-200 dark:border-emerald-300 text-gray-700 dark:text-gray-800 rounded-lg text-sm hover:scale-105 hover:shadow-md transition-all">
                        {city}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </ExpandableSection>
          )}
        </div>
      </div>
    </div>
  );
};
 
export default ExtendedAnalysisCard;
