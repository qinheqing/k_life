import React, { useState, useMemo } from 'react';
import { AnalysisResult, Language } from '../types';
import { Brain, Compass, Download, Briefcase, Gem, Heart, Calendar, Loader2, ChevronDown, ChevronUp, CheckCircle, XCircle, Lightbulb, AlertTriangle, Clock, Palette, Hash, MapPin, Building, ArrowRight, ArrowLeft } from 'lucide-react';
import { getTexts } from '../locales';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface AnalysisSectionProps {
  analysis: AnalysisResult;
  lang: Language;
  theme: 'light' | 'dark';
}

const RatingBar = ({ rating, lang }: { rating: number, lang: Language }) => {
  const t = getTexts(lang);
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-widest">{t.rating}</span>
        <span className="text-sm font-bold text-gray-800 dark:text-gray-700">{rating} / 10</span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-amber-200 rounded-full h-2 overflow-hidden transition-colors duration-200">
        <div
          className={`h-full rounded-full ${
            rating >= 8 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
            rating >= 5 ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
            'bg-gradient-to-r from-orange-400 to-red-500'
          }`}
          style={{ width: `${rating * 10}%` }}
        ></div>
      </div>
    </div>
  )
}

const ExpandableDetailCard = ({ title, icon: Icon, data, lang, className }: { title: string, icon: any, data: any, lang: Language, className?: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'strengths' | 'weaknesses' | 'recommendations' | 'taboos'>('overview');
  const t = getTexts(lang);

  if (!data) return null;

  return (
    <div className={`p-6 rounded-2xl border bg-white dark:bg-amber-50 shadow-sm border-gray-100 dark:border-amber-200 transition-all ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-amber-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-purple-600 dark:text-orange-500 transition-colors duration-200" />
            <h3 className="font-bold text-lg">{title}</h3>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-700 hover:text-purple-600 dark:hover:text-orange-500 transition-colors"
          >
            {isExpanded ? t.collapseDetails : t.expandDetails}
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Summary (Always visible) */}
        {data.summary && (
          <div className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-700">
            {data.summary}
          </div>
        )}

        {/* Rating Bar */}
        {data.rating !== undefined && (
          <RatingBar rating={data.rating} lang={lang} />
        )}
      </div>
      
      {/* Expanded Details */}
      {isExpanded && (
        <div className="p-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-purple-100 dark:bg-orange-200 text-purple-700 dark:text-orange-800'
                  : 'bg-gray-100 dark:bg-amber-100 text-gray-600 dark:text-gray-700 hover:bg-gray-200 dark:hover:bg-amber-200'
              }`}
            >
              {t.tabOverview}
            </button>
            <button
              onClick={() => setActiveTab('strengths')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'strengths'
                  ? 'bg-purple-100 dark:bg-orange-200 text-purple-700 dark:text-orange-800'
                  : 'bg-gray-100 dark:bg-amber-100 text-gray-600 dark:text-gray-700 hover:bg-gray-200 dark:hover:bg-amber-200'
              }`}
            >
              {t.tabStrengths}
            </button>
            <button
              onClick={() => setActiveTab('weaknesses')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'weaknesses'
                  ? 'bg-purple-100 dark:bg-orange-200 text-purple-700 dark:text-orange-800'
                  : 'bg-gray-100 dark:bg-amber-100 text-gray-600 dark:text-gray-700 hover:bg-gray-200 dark:hover:bg-amber-200'
              }`}
            >
              {t.tabWeaknesses}
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'recommendations'
                  ? 'bg-purple-100 dark:bg-orange-200 text-purple-700 dark:text-orange-800'
                  : 'bg-gray-100 dark:bg-amber-100 text-gray-600 dark:text-gray-700 hover:bg-gray-200 dark:hover:bg-amber-200'
              }`}
            >
              {t.tabRecommendations}
            </button>
            <button
              onClick={() => setActiveTab('taboos')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'taboos'
                  ? 'bg-purple-100 dark:bg-orange-200 text-purple-700 dark:text-orange-800'
                  : 'bg-gray-100 dark:bg-amber-100 text-gray-600 dark:text-gray-700 hover:bg-gray-200 dark:hover:bg-amber-200'
              }`}
            >
              {t.tabTaboos}
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="min-h-[100px] custom-scrollbar">
            {activeTab === 'overview' && (
              <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-800 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-amber-50 dark:to-yellow-50 rounded-xl border border-purple-100 dark:border-amber-200">
                {data.details.overview}
              </div>
            )}

            {activeTab === 'strengths' && (
              <ul className="space-y-3">
                {data.details.strengths.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-amber-50 rounded-xl border border-green-100 dark:border-amber-200 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-800">{item}</span>
                  </li>
                ))}
              </ul>
            )}

            {activeTab === 'weaknesses' && (
              <ul className="space-y-3">
                {data.details.weaknesses.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-amber-50 rounded-xl border border-red-100 dark:border-amber-200 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-800">{item}</span>
                  </li>
                ))}
              </ul>
            )}

            {activeTab === 'recommendations' && (
              <ul className="space-y-3">
                {data.details.recommendations.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-amber-50 rounded-xl border border-yellow-100 dark:border-amber-200 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                    <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-800">{item}</span>
                  </li>
                ))}
              </ul>
            )}

            {activeTab === 'taboos' && (
              <ul className="space-y-3">
                {data.details.taboos.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-amber-50 rounded-xl border border-orange-100 dark:border-amber-200 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                    <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-800">{item}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Best Timing */}
            {data.details.bestTiming && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-amber-200">
                <div className="flex items-center gap-2 text-sm p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-amber-50 dark:to-yellow-50 rounded-xl border border-blue-100 dark:border-amber-200">
                  <Clock className="w-4 h-4 text-purple-600 dark:text-orange-500" />
                  <span className="font-medium text-gray-700 dark:text-gray-800">{t.bestTiming}：</span>
                  <span className="text-gray-600 dark:text-gray-700">{data.details.bestTiming}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Geographic Analysis Card Component
const GeographicCard = ({ title, subtitle, data, lang }: { title: string, subtitle: string, data: any, lang: Language }) => {
  const t = getTexts(lang);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!data) return null;

  return (
    <div className="bg-white dark:bg-amber-50 rounded-2xl border border-gray-100 dark:border-amber-200 shadow-sm transition-all">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-amber-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-5 h-5 text-purple-600 dark:text-orange-500" />
              <h3 className="font-bold text-lg">{title}</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-600">{subtitle}</p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-700 hover:text-purple-600 dark:hover:bg-orange-500 transition-colors"
          >
            {isExpanded ? t.collapseDetails : t.expandDetails}
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        {data.rating !== undefined && (
          <RatingBar rating={data.rating} lang={lang} />
        )}
      </div>
      
      {/* Expanded Details */}
      {isExpanded && (
        <div className="p-6 space-y-4 custom-scrollbar">
          {/* Recommended Directions */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-orange-50 dark:to-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <Compass className="w-5 h-5 text-purple-600 dark:text-orange-500" />
              <h4 className="font-bold text-gray-800 dark:text-gray-900">{t.recommendedDirection}</h4>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1">
                <ArrowRight className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-800">{data.recommendedDirections.primary}</span>
              </div>
              <div className="flex items-center gap-1">
                <ArrowRight className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-800">{data.recommendedDirections.secondary}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-700">{data.recommendedDirections.description}</p>
          </div>

          {/* Recommended City Types */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-amber-50 dark:to-yellow-100">
            <div className="flex items-center gap-2 mb-2">
              <Building className="w-5 h-5 text-green-600 dark:text-orange-600" />
              <h4 className="font-bold text-gray-800 dark:text-gray-900">{t.cityTypes}</h4>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {data.recommendedCityTypes.types.map((type: string, idx: number) => (
                <span key={idx} className="px-3 py-1 bg-green-100 dark:bg-orange-200 text-green-700 dark:text-orange-800 rounded-full text-sm">
                  {type}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {data.recommendedCityTypes.examples.map((city: string, idx: number) => (
                <span key={idx} className="px-3 py-1 bg-white dark:bg-white border border-green-200 dark:border-orange-300 text-gray-700 dark:text-gray-800 rounded-full text-sm">
                  {city}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-700">{data.recommendedCityTypes.description}</p>
          </div>

          {/* Migration Advice */}
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <ArrowLeft className="w-5 h-5 text-blue-600 dark:text-orange-600" />
              <h4 className="font-bold text-gray-800 dark:text-gray-900">{t.migrationTiming}</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-700 mb-3">{data.migrationAdvice.timing}</p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-gray-600 dark:text-gray-700">
                  <span className="font-medium">准备：</span>
                  {data.migrationAdvice.preparation.join('、')}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-gray-600 dark:text-gray-700">
                  <span className="font-medium">注意：</span>
                  {data.migrationAdvice.considerations.join('、')}
                </span>
              </div>
            </div>
          </div>

          {/* Workplace Arrangement */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-50 dark:to-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-5 h-5 text-blue-600 dark:text-orange-600" />
              <h4 className="font-bold text-gray-800 dark:text-gray-900">{t.workplaceArrangement}</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-700">{data.workplaceArrangement}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Yearly Review Item Component (with enhanced info)
const YearlyReviewItem = ({ year, lang }: { year: any, lang: Language, key?: React.Key }) => {
  const t = getTexts(lang);
  const enhanced = year.enhanced;

  // Normal year: brief display with enhanced info
  if (!year.isKeyYear) {
    return (
      <div className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-amber-100 transition-colors border-b border-gray-50 dark:border-amber-200 last:border-0">
        <div className="flex-shrink-0 w-16 text-center">
          <div className="font-bold text-lg" style={{color: 'var(--text-primary)'}}>{year.year}</div>
          <div className="text-xs" style={{color: 'var(--text-muted)'}}>{year.age}{lang === 'zh' ? '岁' : 'y/o'}</div>
        </div>

        <div className="flex-1 space-y-2">
          {/* Top row: trend + brief */}
          <div className="flex items-start gap-3">
            {/* Trend icon and label */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium" style={{
              backgroundColor: enhanced?.trend === 'rising' ? '#dcfce7' :
                               enhanced?.trend === 'falling' ? '#fee2e2' :
                               enhanced?.trend === 'volatile' ? '#e0f2fe' : '#f3f4f6',
              color: enhanced?.trend === 'rising' ? '#166534' :
                     enhanced?.trend === 'falling' ? '#991b1b' :
                     enhanced?.trend === 'volatile' ? '#075985' : '#4b5563'
            }}>
              <span>{enhanced?.trendIcon || ''}</span>
              <span>{enhanced?.trendLabel || ''}</span>
              <span className="text-xs opacity-70">
                ({enhanced?.changePercent > 0 ? '+' : ''}{enhanced?.changePercent || 0}%)
              </span>
            </div>

            {/* Strength stars */}
            {enhanced && (
              <div className="text-xs" style={{color: 'var(--text-muted)'}}>
                {enhanced.strengthIcon}
              </div>
            )}

            {/* Stage badge */}
            {enhanced && (
              <div className={`px-2 py-0.5 rounded-full text-xs font-medium border ${enhanced.stageColor}`}>
                {enhanced.stageLabel}
              </div>
            )}
          </div>

          {/* Brief description */}
          <div className="flex items-start gap-2">
            <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${year.close >= year.open ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm leading-relaxed" style={{color: 'var(--text-secondary)'}}>
              {year.yearlyReview?.brief || year.summary}
            </span>
          </div>

          {/* Additional info row */}
          {enhanced && (
            <div className="flex items-center gap-3 text-xs" style={{color: 'var(--text-muted)'}}>
              {/* Year element */}
              {enhanced.yearElement && (
                <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-amber-100">
                  {enhanced.yearElement}年
                </span>
              )}
              {/* Zodiac */}
              {enhanced.yearZodiac && (
                <span>{enhanced.yearZodiac}</span>
              )}
              {/* DaYun start */}
              {enhanced.isDaYunStart && (
                <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-orange-100 text-purple-700 dark:text-orange-800 font-medium">
                  {lang === 'zh' ? '大运开始' : 'DaYun Start'}
                </span>
              )}
              {/* Pivot year */}
              {enhanced.isPivotYear && (
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-100 text-blue-700 dark:text-blue-800 font-medium">
                  {lang === 'zh' ? '转折年' : 'Turning Point'}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Key year: detailed display
  return (
    <div className="flex gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-orange-50 dark:to-amber-100 transition-colors border border-purple-200 dark:border-orange-200 mb-4">
      <div className="flex-shrink-0 w-16 text-center">
        <div className="font-bold text-lg text-purple-700 dark:text-orange-700">{year.year}</div>
        <div className="text-xs text-purple-500 dark:text-orange-600">{year.age}{lang === 'zh' ? '岁' : 'y/o'}</div>
        <div className="mt-1 text-xs px-2 py-0.5 bg-purple-100 dark:bg-orange-200 text-purple-700 dark:text-orange-800 rounded-full font-medium">
          {t.keyYear}
        </div>
        {/* Show star rating for key years */}
        {enhanced && (
          <div className="mt-1 text-xs" style={{color: 'var(--text-muted)'}}>
            {enhanced.strengthIcon}
          </div>
        )}
      </div>

      <div className="flex-1 space-y-2">
        {/* Header with enhanced info */}
        <div className="flex items-center gap-2 flex-wrap">
          {year.isPeak && <span className="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-200 text-yellow-700 dark:text-yellow-800 rounded-full font-bold">★ {t.peak}</span>}
          <div className={`w-2 h-2 rounded-full ${year.close >= year.open ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs font-bold text-gray-500 dark:text-gray-600">{year.summary}</span>

          {/* Enhanced tags */}
          {enhanced && (
            <>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${enhanced.stageColor}`}>
                {enhanced.stageLabel}
              </span>
              <span className="text-xs" style={{color: 'var(--text-muted)'}}>
                {enhanced.trendIcon} {enhanced.trendLabel} ({enhanced.changePercent > 0 ? '+' : ''}{enhanced.changePercent}%)
              </span>
            </>
          )}
        </div>

        {/* Detailed content */}
        {year.yearlyReview?.detailed && (
          <div className="space-y-2 pt-2">
            {/* Career */}
            <div className="flex items-start gap-2">
              <Briefcase className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-700">{t.career}：</span>
                <p className="text-sm text-gray-700 dark:text-gray-800">{year.yearlyReview.detailed.career}</p>
              </div>
            </div>
            
            {/* Wealth */}
            <div className="flex items-start gap-2">
              <Gem className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-700">{t.wealth}：</span>
                <p className="text-sm text-gray-700 dark:text-gray-800">{year.yearlyReview.detailed.wealth}</p>
              </div>
            </div>
            
            {/* Health */}
            <div className="flex items-start gap-2">
              <Heart className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-700">{t.health}：</span>
                <p className="text-sm text-gray-700 dark:text-gray-800">{year.yearlyReview.detailed.health}</p>
              </div>
            </div>
            
            {/* Advice */}
            <div className="flex items-start gap-2 mt-2 pt-2 border-t border-purple-200 dark:border-orange-200">
              <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-700">{t.advice}：</span>
                <p className="text-sm text-gray-700 dark:text-gray-800">{year.yearlyReview.detailed.advice}</p>
              </div>
            </div>
            
            {/* Lucky Items */}
            {(year.yearlyReview.detailed.luckyColor || year.yearlyReview.detailed.luckyNumber) && (
              <div className="flex gap-3 mt-2 pt-2 border-t border-purple-200 dark:border-orange-200">
                {year.yearlyReview.detailed.luckyColor && (
                  <div className="flex items-center gap-1">
                    <Palette className="w-4 h-4 text-purple-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-700">{t.luckyColor}：{year.yearlyReview.detailed.luckyColor}</span>
                  </div>
                )}
                {year.yearlyReview.detailed.luckyNumber && (
                  <div className="flex items-center gap-1">
                    <Hash className="w-4 h-4 text-blue-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-700">{t.luckyNumber}：{year.yearlyReview.detailed.luckyNumber}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const AnalysisSection: React.FC<AnalysisSectionProps> = ({ analysis, lang, theme }) => {
  const t = getTexts(lang);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const handleDownloadPDF = async () => {
    let hadDarkClass = false;
    let hadPdfCaptureClass = false;
    let originalBodyBg = '';
    const scrollableAdjustments: { el: HTMLElement, maxHeight: string, overflowY: string, height: string, paddingRight: string }[] = [];
    
    setIsGeneratingPdf(true);
    try {
      // Find main content div
      const element = document.querySelector('main');
      if (!element) return;

      // Temporarily remove dark mode class from html element to force light theme for PDF
      const htmlElement = document.documentElement;
      const bodyElement = document.body as HTMLElement;
      hadPdfCaptureClass = htmlElement.classList.contains('pdf-capture-mode');
      hadDarkClass = htmlElement.classList.contains('dark');
      if (hadDarkClass) {
        htmlElement.classList.remove('dark');
      }

      // Disable transitions/animations during capture to avoid partially rendered frames
      htmlElement.classList.add('pdf-capture-mode');

      // Ensure a solid white background while capturing
      originalBodyBg = bodyElement.style.backgroundColor;
      bodyElement.style.backgroundColor = '#ffffff';

      // Expand scrollable sections (e.g., yearly review list) so all content is captured
      const scrollables = Array.from(element.querySelectorAll('.custom-scrollbar')) as HTMLElement[];
      scrollables.forEach((el) => {
        scrollableAdjustments.push({
          el,
          maxHeight: el.style.maxHeight,
          overflowY: el.style.overflowY,
          height: el.style.height,
          paddingRight: el.style.paddingRight,
        });
        el.style.maxHeight = 'none';
        el.style.overflowY = 'visible';
        el.style.height = 'auto';
        el.style.paddingRight = '0';
        el.scrollTop = 0;
      });

      // Wait for CSS transitions to complete fully
      await new Promise(resolve => setTimeout(resolve, 250));

      const canvas = await html2canvas(element as HTMLElement, {
        scale: window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio || 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        ignoreElements: (el) => {
          return el.classList.contains('print:hidden') ||
                 el.hasAttribute('data-html2canvas-ignore') ||
                 (el.tagName === 'DIV' && (el as HTMLElement).style.position === 'fixed' && (el as HTMLElement).style.zIndex === '9999');
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${lang === 'zh' ? '人生K线报告' : 'Life_K_Line_Report'}.pdf`);

    } catch (error) {
      console.error("PDF Generation failed", error);
      alert("Failed to generate PDF. You can try printing page.");
    } finally {
      const htmlElement = document.documentElement;
      const bodyElement = document.body as HTMLElement;
      // Restore dark mode if it was enabled
      if (hadDarkClass) {
        htmlElement.classList.add('dark');
      }
      // Restore pdf capture related changes
      if (!hadPdfCaptureClass) {
        htmlElement.classList.remove('pdf-capture-mode');
      }
      bodyElement.style.backgroundColor = originalBodyBg;
      scrollableAdjustments.forEach(({ el, maxHeight, overflowY, height, paddingRight }) => {
        el.style.maxHeight = maxHeight;
        el.style.overflowY = overflowY;
        el.style.height = height;
        el.style.paddingRight = paddingRight;
      });
      setIsGeneratingPdf(false);
    }
  };
  
  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* 6 Grid Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analysis.geographicDevelopment && (
          <GeographicCard 
            title={t.geographicTitle} 
            subtitle={t.geographicSubtitle}
            data={analysis.geographicDevelopment} 
            lang={lang}
          />
        )}
        {analysis.personality && (
          <ExpandableDetailCard 
            title={t.personalityTitle} 
            icon={Brain} 
            data={analysis.personality} 
            lang={lang}
          />
        )}
        {analysis.career && (
          <ExpandableDetailCard 
            title={t.careerTitle} 
            icon={Briefcase} 
            data={analysis.career} 
            lang={lang}
          />
        )}
        {analysis.fengShui && (
          <ExpandableDetailCard 
            title={t.fengShuiTitle} 
            icon={Compass} 
            data={analysis.fengShui} 
            lang={lang}
          />
        )}
        {analysis.wealth && (
          <ExpandableDetailCard 
            title={t.wealthTitle} 
            icon={Gem} 
            data={analysis.wealth} 
            lang={lang}
          />
        )}
        {analysis.marriage && (
          <ExpandableDetailCard 
            title={t.marriageTitle} 
            icon={Heart} 
            data={analysis.marriage} 
            lang={lang}
          />
        )}
      </div>

      {/* Yearly Detailed Evaluation */}
      {analysis.timeline && analysis.timeline.length > 0 && (
        <div className="bg-white dark:bg-amber-50 rounded-2xl shadow-sm border border-gray-100 dark:border-amber-200 p-8 transition-colors duration-200">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-6 h-6 text-purple-600 dark:text-orange-500 transition-colors duration-200" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-gray-800 transition-colors duration-200">{t.yearlyReviewTitle}</h2>
          </div>
          <div className="space-y-4 custom-scrollbar">
            {analysis.timeline.map((year: any, index: number) => (
              <YearlyReviewItem key={index} year={year} lang={lang} />
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center mt-8 pb-12 print:hidden" data-html2canvas-ignore="true">
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPdf}
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-orange-500 text-white rounded-full font-medium hover:bg-gray-800 dark:hover:bg-orange-600 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isGeneratingPdf ? (lang === 'zh' ? '生成中...' : 'Generating...') : t.savePdf}
        </button>
      </div>
    </div>
  );
};

export default AnalysisSection;
