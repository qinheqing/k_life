import React from 'react';
import { Language } from '../types';
import { getTexts } from '../locales';
import { Brain, Book, Zap, Activity, Sparkles } from 'lucide-react';

interface BasicAnalysisCardProps {
  data: any;
  lang: Language;
  theme: 'light' | 'dark';
}

const BasicAnalysisCard: React.FC<BasicAnalysisCardProps> = ({ data, lang, theme }) => {
  const t = getTexts(lang);

  return (
    <div className="decoration-container decoration-container--purple glass-card-light p-8 progressive-reveal">
      <div className="decoration-container-content">
        <div className="flex items-center gap-3 mb-8 slide-in-content" style={{animationDelay: '0.1s'}}>
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 dark:from-yellow-400 dark:to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-500 dark:from-yellow-400 dark:to-orange-500 rounded-xl opacity-20 blur-xl animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-bold luxury-heading">{lang === 'zh' ? '基础分析' : 'Basic Analysis'}</h2>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 relative overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 progressive-reveal-fast" style={{animationDelay: '0.2s'}}>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-transparent to-yellow-400/5"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-md">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg text-gray-800 dark:text-gray-700">{lang === 'zh' ? '命主属性' : 'Main Attribute'}</span>
              </div>
              <p className="text-xl font-semibold text-gray-800 dark:text-gray-700 mb-2">{data.mainAttribute}</p>
              <p className="text-sm text-gray-600 dark:text-gray-700 leading-relaxed">{data.strengthAnalysis?.strengthDescription}</p>
            </div>
          </div>

          <div className="progressive-reveal-fast" style={{animationDelay: '0.4s'}}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 dark:from-yellow-400 dark:to-orange-500 rounded-lg flex items-center justify-center shadow-md">
                <Book className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-800 dark:text-gray-700">{lang === 'zh' ? '五行分析' : 'Five Elements Analysis'}</h3>
            </div>
            <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
              <table className="w-full text-sm table-fixed border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-amber-300">
                    <th className="py-3 px-4 text-left text-gray-600 dark:text-gray-700 font-semibold">{lang === 'zh' ? '柱' : 'Pillar'}</th>
                    <th className="py-3 px-4 text-left text-gray-600 dark:text-gray-700 font-semibold">{lang === 'zh' ? '天干' : 'Stem'}</th>
                    <th className="py-3 px-4 text-left text-gray-600 dark:text-gray-700 font-semibold">{lang === 'zh' ? '地支' : 'Branch'}</th>
                    <th className="py-3 px-4 text-left text-gray-600 dark:text-gray-700 font-semibold">{lang === 'zh' ? '五行' : 'Element'}</th>
                    <th className="py-3 px-4 text-left text-gray-600 dark:text-gray-700 font-semibold">{lang === 'zh' ? '纳音' : 'NaYin'}</th>
                    <th className="py-3 px-4 text-left text-gray-600 dark:text-gray-700 font-semibold">{lang === 'zh' ? '生肖' : 'Zodiac'}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 dark:border-amber-200 hover:bg-purple-50 dark:hover:bg-amber-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-900">{lang === 'zh' ? '年' : 'Year'}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-800">{data.pillars?.year?.gan}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-800">{data.pillars?.year?.zhi}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-800">{data.pillars?.year?.wuxing}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-800">{data.pillars?.year?.naYin}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-800">{data.pillars?.year?.shengXiao}</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-amber-200 hover:bg-purple-50 dark:hover:bg-amber-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-900">{lang === 'zh' ? '月' : 'Month'}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-800">{data.pillars?.month?.gan}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-800">{data.pillars?.month?.zhi}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-800">{data.pillars?.month?.wuxing}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-800">{data.pillars?.month?.naYin}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-800">{data.pillars?.month?.shengXiao}</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-amber-200 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-orange-50 dark:to-yellow-50">
                    <td className="py-3 px-4 font-bold text-purple-700 dark:text-orange-700">{lang === 'zh' ? '日' : 'Day'}</td>
                    <td className="py-3 px-4 font-bold text-purple-700 dark:text-orange-700">{data.pillars?.day?.gan}</td>
                    <td className="py-3 px-4 font-bold text-purple-700 dark:text-orange-700">{data.pillars?.day?.zhi}</td>
                    <td className="py-3 px-4 font-bold text-purple-700 dark:text-orange-700">{data.pillars?.day?.wuxing}</td>
                    <td className="py-3 px-4 font-bold text-purple-700 dark:text-orange-700">{data.pillars?.day?.naYin}</td>
                    <td className="py-3 px-4 font-bold text-purple-700 dark:text-orange-700">{data.pillars?.day?.shengXiao}</td>
                  </tr>
                  <tr className="hover:bg-purple-50 dark:hover:bg-amber-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-900">{lang === 'zh' ? '时' : 'Hour'}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-800">{data.pillars?.hour?.gan}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-800">{data.pillars?.hour?.zhi}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-800">{data.pillars?.hour?.wuxing}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-800">{data.pillars?.hour?.naYin}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-800">{data.pillars?.hour?.shengXiao}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="progressive-reveal-fast" style={{animationDelay: '0.6s'}}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 dark:from-yellow-400 dark:to-orange-500 rounded-lg flex items-center justify-center shadow-md">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-800 dark:text-gray-700">{lang === 'zh' ? '十神分析' : 'ShiShen Analysis'}</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.shiShenAnalysis && (
                <>
                  <div className="glass-card p-4 text-center hover:shadow-lg hover:scale-105 transition-all duration-300">
                    <div className="text-xs text-gray-500 dark:text-gray-600 mb-2 font-medium">{lang === 'zh' ? '年干' : 'Year'}</div>
                    <div className="font-bold text-lg text-gray-800 dark:text-gray-900">{data.shiShenAnalysis.year}</div>
                  </div>
                  <div className="glass-card p-4 text-center hover:shadow-lg hover:scale-105 transition-all duration-300">
                    <div className="text-xs text-gray-500 dark:text-gray-600 mb-2 font-medium">{lang === 'zh' ? '月干' : 'Month'}</div>
                    <div className="font-bold text-lg text-gray-800 dark:text-gray-900">{data.shiShenAnalysis.month}</div>
                  </div>
                  <div className="glass-card p-4 text-center border-2 border-purple-300 dark:border-orange-300 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-transparent"></div>
                    <div className="relative">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Sparkles className="w-3 h-3 text-purple-600 dark:text-orange-600" />
                        <div className="text-xs text-purple-600 dark:text-orange-600 font-bold">{lang === 'zh' ? '日主' : 'Day'}</div>
                      </div>
                      <div className="font-bold text-xl text-purple-700 dark:text-orange-700">{data.shiShenAnalysis.dayMasterShiShen}</div>
                    </div>
                  </div>
                  <div className="glass-card p-4 text-center hover:shadow-lg hover:scale-105 transition-all duration-300">
                    <div className="text-xs text-gray-500 dark:text-gray-600 mb-2 font-medium">{lang === 'zh' ? '时干' : 'Hour'}</div>
                    <div className="font-bold text-lg text-gray-800 dark:text-gray-900">{data.shiShenAnalysis.hour}</div>
                  </div>
                </>
              )}
            </div>
            {data.basicAnalysis?.naYin?.description && (
              <div className="glass-card p-4 mt-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-amber-100 dark:to-yellow-100 border border-yellow-200 dark:border-yellow-300">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-600 dark:text-yellow-700 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-700 mb-1">{lang === 'zh' ? '纳音解析' : 'NaYin Analysis'}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-800 leading-relaxed">{data.basicAnalysis.naYin.description}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
 
          <div className="glass-card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-100 dark:to-indigo-100 border border-blue-200 dark:border-blue-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 dark:from-blue-400 dark:to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-700">{lang === 'zh' ? '命主强弱' : 'Strength Analysis'}</h3>
              </div>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex-1">
                  <div className="w-full bg-white dark:bg-white rounded-full h-4 shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        data.strengthAnalysis?.strengthLevel >= 7 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                        data.strengthAnalysis?.strengthLevel >= 5 ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                        'bg-gradient-to-r from-orange-400 to-red-500'
                      }`}
                      style={{ width: `${data.strengthAnalysis?.strengthLevel * 10}%` }}
                    ></div>
                  </div>
                </div>
                <span className="font-bold text-2xl text-gray-800 dark:text-gray-900 min-w-[70px] text-right">
                  {data.strengthAnalysis?.strengthLevel}/10
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-800 leading-relaxed">
                <span className="font-semibold">{data.strengthAnalysis?.dayMasterBalance}</span> - {data.strengthAnalysis?.strengthDescription}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicAnalysisCard;
