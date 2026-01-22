import React, { useState, useEffect, useRef } from 'react';
import LandingPage from './components/LandingPage';
import AccessCodeForm from './components/AccessCodeForm';
import InputForm from './components/InputForm';
import BaZiDisplay from './components/BaZiDisplay';
import BaZiConfirmation from './components/BaZiConfirmation';
import KLineChart from './components/KLineChart';
import AnalysisSection from './components/AnalysisSection';
import ApiQuotaDialog from './components/ApiQuotaDialog';
import WeChatModal from './components/WeChatModal';
import ProgressBar from './components/ProgressBar';
import LoadingContent from './components/LoadingContent';
import AnalysisSkeleton from './components/AnalysisSkeleton';
import OnboardingTips from './components/OnboardingTips';
import BasicAnalysisCard from './components/BasicAnalysisCard';
import ExtendedAnalysisCard from './components/ExtendedAnalysisCard';
import { UserInput, AnalysisResult, Language, BaZiResult, PartialAnalysisResult } from './types';
import { calculateBaZi, generateDestinyAnalysis, testAIConnection } from './services/aiService';
import { markCodeAsUsed } from './services/accessCodeService';
import { Sparkles, Languages, Moon, Sun, MessageCircle } from 'lucide-react';
import { getTexts } from './locales';

type ErrorType = 'network' | 'timeout' | 'quota' | 'server' | 'unknown';

const App: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<'landing' | 'code-entry' | 'input' | 'confirmation' | 'result'>('landing');
  const [loading, setLoading] = useState(false);
  const [showQuotaDialog, setShowQuotaDialog] = useState(false);
  const [showWeChatModal, setShowWeChatModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [progress, setProgress] = useState<number>(0);
  const [progressStep, setProgressStep] = useState<string>('');
  const [estimatedTime, setEstimatedTime] = useState<number | undefined>(undefined);
  const [errorType, setErrorType] = useState<ErrorType>('unknown');

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      // Default to light theme if no saved preference
      if (savedTheme) {
        return savedTheme as 'light' | 'dark';
      }
      return 'light';
    }
    return 'light';
  });

  const [lang, setLang] = useState<Language>('zh'); 

  const [preliminaryBaZi, setPreliminaryBaZi] = useState<BaZiResult | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [partialAnalysis, setPartialAnalysis] = useState<PartialAnalysisResult | null>(null);
  const [accessCode, setAccessCode] = useState<string | null>(null);

  const t = getTexts(lang);

  // Effect to apply theme class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Effect to scroll to new content when partialAnalysis updates
  useEffect(() => {
    if (loading && step === 'confirmation' && partialAnalysis && contentRef.current) {
      const scrollToElement = () => {
        const contentRect = contentRef.current?.getBoundingClientRect();
        if (contentRect) {
          window.scrollTo({
            top: window.scrollY + contentRect.height - 200,
            behavior: 'smooth'
          });
        }
      };
      const timer = setTimeout(scrollToElement, 300);
      return () => clearTimeout(timer);
    }
  }, [partialAnalysis, loading, step]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'zh' : 'en');
  };

  const detectErrorType = (error: any): ErrorType => {
    const errorMessage = error?.message?.toLowerCase() || '';
    const errorString = error?.toString().toLowerCase() || '';

    if (errorMessage.includes('quota') || errorMessage.includes('rate limit') || 
        errorMessage.includes('429') || errorMessage.includes('insufficient quota') ||
        errorMessage.includes('balance insufficient')) {
      return 'quota';
    }

    if (errorMessage.includes('timeout') || errorMessage.includes('etimeout') ||
        errorMessage.includes('network error') || errorMessage.includes('failed to fetch')) {
      return 'network';
    }

    if (errorMessage.includes('500') || errorMessage.includes('502') || 
        errorMessage.includes('503') || errorMessage.includes('504')) {
      return 'server';
    }

    if (errorMessage.includes('timeout') && errorMessage.includes('etime')) {
      return 'timeout';
    }

    return 'unknown';
  };

  // Step 1: Calculate BaZi
  const handleInitialSubmit = async (data: UserInput) => {
    setLoading(true);
    try {
      const result = await calculateBaZi(data);
      setPreliminaryBaZi(result);
      setStep('confirmation');
    } catch (error: any) {
      console.error(error);
      // Show quota dialog for all API errors
      setShowQuotaDialog(true);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Confirm BaZi and Generate K-Line
  const handleBaZiConfirm = async (confirmedData: BaZiResult) => {
    setLoading(true);
    setProgress(0);
    setProgressStep('');
    setEstimatedTime(undefined);
    setErrorType('unknown');

    try {
      // 首先测试API连接
      setProgressStep(lang === 'zh' ? '正在验证AI连接...' : 'Verifying AI connection...');
      const connectionTest = await testAIConnection();

      if (!connectionTest.success) {
        console.error('❌ API连接测试失败:', connectionTest.error);
        throw new Error(`API连接失败: ${connectionTest.message}. 详细信息: ${JSON.stringify(connectionTest.error)}`);
      }

      console.log('✅ API连接正常，开始分析...');
      setProgressStep(lang === 'zh' ? 'AI连接正常，开始分析...' : 'AI connected, starting analysis...');

      const result = await generateDestinyAnalysis(confirmedData, lang, (progressValue, stepText, time, partialResult) => {
        setProgress(progressValue);
        setProgressStep(stepText);
        setEstimatedTime(time);
        if (partialResult) {
          setPartialAnalysis(prev => ({ ...prev, ...partialResult }));
        }
      });

      setAnalysis(result);

      if (accessCode) {
        await markCodeAsUsed(accessCode, confirmedData.userInput.name || 'Anonymous');
      }

      setStep('result');
    } catch (error: any) {
      console.error('分析失败:', error);
      const detectedErrorType = detectErrorType(error);
      setErrorType(detectedErrorType);
      setShowQuotaDialog(true);
    } finally {
      setLoading(false);
      setProgress(0);
      setProgressStep('');
      setEstimatedTime(undefined);
    }
  };

  const handleReset = () => {
    setStep('landing');
    setPreliminaryBaZi(null);
    setAnalysis(null);
    setPartialAnalysis(null);
    setAccessCode(null);
    window.scrollTo(0, 0);
  };

  const handleGetStarted = () => {
    setStep('code-entry');
    window.scrollTo(0, 0);
  };

  const handleAccessCodeVerified = (code: string) => {
    setAccessCode(code);
    setStep('input');
    window.scrollTo(0, 0);
  };

  // Show landing page without header
  if (step === 'landing') {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background Decoration */}
        <div className="bg-decoration">
          <div className="bg-orb bg-orb-1 animate-float"></div>
          <div className="bg-orb bg-orb-2 animate-float" style={{animationDelay: '-10s'}}></div>
          <div className="bg-orb bg-orb-3 animate-float" style={{animationDelay: '-5s'}}></div>
        </div>

        {/* Premium Header for Landing */}
        <header className="glass-card sticky top-0 z-40 transition-colors duration-300" style={{
          borderBottom: `1px solid var(--border-subtle)`
        }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4 animate-luxury-fade-in">
              <div className="relative group">
                <div className="text-white p-3 rounded-2xl shadow-lg" style={{
                  background: `linear-gradient(135deg, var(--accent-primary), var(--accent-emphasis))`
                }}>
                  <Sparkles size={24} />
                </div>
                <div className="absolute inset-0 rounded-2xl opacity-20 blur-lg group-hover:opacity-40 transition-opacity" style={{
                  background: `linear-gradient(135deg, var(--accent-primary), var(--accent-emphasis))`
                }}></div>
              </div>
              <div>
                <h1 className="text-xl font-bold luxury-heading leading-none">{t.appTitle}</h1>
                <p className="text-xs font-medium tracking-wider uppercase" style={{color: 'var(--text-muted)'}}>AI Destiny Analysis</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
               {/* WeChat Button */}
               <button
                 onClick={() => setShowWeChatModal(true)}
                 className="glass-card p-3 text-gray-400 hover:text-yellow-400 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105"
                 title="Contact via WeChat"
               >
                 <MessageCircle size={20} />
               </button>

               {/* Theme Toggle */}
               <button
                 onClick={toggleTheme}
                 className="glass-card p-3 text-gray-400 hover:text-yellow-400 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105"
                 title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
               >
                 {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
               </button>

               {/* Language Toggle */}
               <button
                 onClick={toggleLanguage}
                 className="glass-card px-4 py-2 text-gray-400 hover:text-yellow-400 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105 text-sm font-medium flex items-center gap-2"
               >
                 <Languages size={16} />
                 <span>{lang === 'en' ? '中文' : 'English'}</span>
               </button>
            </div>
          </div>
        </header>

        <LandingPage onGetStarted={handleGetStarted} lang={lang} />

        {/* WeChat Modal for Landing Page */}
        <WeChatModal
          isOpen={showWeChatModal}
          onClose={() => setShowWeChatModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Decoration */}
      <div className="bg-decoration">
        <div className="bg-orb bg-orb-1 animate-float"></div>
        <div className="bg-orb bg-orb-2 animate-float" style={{animationDelay: '-10s'}}></div>
        <div className="bg-orb bg-orb-3 animate-float" style={{animationDelay: '-5s'}}></div>
      </div>

      {/* Luxury Header */}
      <header className="glass-card sticky top-0 z-40 print:hidden transition-colors duration-300" data-html2canvas-ignore="true" style={{
        borderBottom: `1px solid var(--border-subtle)`
      }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={handleReset}>
            <div className="relative">
              <div className="text-white p-3 rounded-2xl shadow-lg group-hover:shadow-xl transition-all" style={{
                background: `linear-gradient(135deg, var(--accent-primary), var(--accent-emphasis))`
              }}>
                <Sparkles size={24} />
              </div>
              <div className="absolute inset-0 rounded-2xl opacity-20 blur-lg group-hover:opacity-40 transition-opacity" style={{
                background: `linear-gradient(135deg, var(--accent-primary), var(--accent-emphasis))`
              }}></div>
            </div>
            <div>
              <h1 className="text-xl font-bold luxury-heading leading-none">{t.appTitle}</h1>
              <p className="text-xs font-medium tracking-wider uppercase" style={{color: 'var(--text-muted)'}}>AI Destiny Analysis</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
             {/* WeChat Button */}
             <button
                onClick={() => setShowWeChatModal(true)}
                className="glass-card p-3 text-gray-400 hover:text-yellow-400 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105"
                title="Contact via WeChat"
             >
                <MessageCircle size={20} />
             </button>

             {/* Theme Toggle */}
             <button
                onClick={toggleTheme}
                className="glass-card p-3 text-gray-400 hover:text-yellow-400 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105"
                title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
             >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
             </button>

             {/* Language Toggle */}
             <button
                onClick={toggleLanguage}
                className="glass-card px-4 py-2 text-gray-400 hover:text-yellow-400 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105 text-sm font-medium flex items-center gap-2"
             >
                <Languages size={16} />
                <span>{lang === 'en' ? '中文' : 'English'}</span>
             </button>

             {step !== 'input' && (
                <button
                    onClick={handleReset}
                    className="glass-card px-4 py-2 text-sm font-medium text-gray-400 hover:text-yellow-400 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105 flex items-center gap-2"
                >
                    <span>←</span>
                    <span>{t.newReading}</span>
                </button>
             )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow relative z-10">
        <div className="max-w-6xl mx-auto px-4 py-16">
          {step === 'code-entry' && (
            <div className="flex flex-col items-center justify-center min-h-[70vh] animate-luxury-fade-in">
              <AccessCodeForm onVerified={handleAccessCodeVerified} lang={lang} />
            </div>
          )}

          {step === 'input' && (
              <>
                {showOnboarding && (
                  <OnboardingTips lang={lang} onClose={() => setShowOnboarding(false)} />
                )}
                
                <div className="space-y-16">
                  {/* Hero Section */}
                  <div className="text-center max-w-4xl mx-auto animate-luxury-slide-up">
                    <div className="inline-flex items-center gap-3 mb-8">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                    </div>
                    
                    <h2 className="text-5xl md:text-7xl font-bold luxury-heading mb-6">
                        {t.heroTitle1}
                    </h2>
                    <h3 className="text-4xl md:text-6xl font-bold mb-8">
                        <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent animate-gradient-shift">
                            {t.heroTitle2}
                        </span>
                    </h3>
                    <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
                        {t.heroDescription}
                    </p>
                    
                    {/* Stats */}
                    <div className="flex justify-center gap-12 mt-12 text-center">
                      <div className="glass-card p-6">
                        <div className="text-3xl font-bold text-yellow-400">98%</div>
                        <div className="text-gray-400 text-sm mt-1">{lang === 'zh' ? '准确率' : 'Accuracy'}</div>
                      </div>
                      <div className="glass-card p-6">
                        <div className="text-3xl font-bold text-yellow-400">3min</div>
                        <div className="text-gray-400 text-sm mt-1">{lang === 'zh' ? '快速分析' : 'Fast Analysis'}</div>
                      </div>
                      <div className="glass-card p-6">
                        <div className="text-3xl font-bold text-yellow-400">100+</div>
                        <div className="text-gray-400 text-sm mt-1">{lang === 'zh' ? '分析维度' : 'Dimensions'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="animate-luxury-scale-in animate-delay-300">
                    <InputForm onSubmit={handleInitialSubmit} isLoading={loading} lang={lang} />
                  </div>
                </div>
              </>
          )}

          {step === 'confirmation' && preliminaryBaZi && (
             <>
              {!loading ? (
                <BaZiConfirmation
                   data={preliminaryBaZi}
                   onConfirm={handleBaZiConfirm}
                   onRetry={() => setStep('input')}
                   lang={lang}
                   isLoading={loading}
                />
              ) : (
                 <div className="space-y-8" ref={contentRef}>
                   {partialAnalysis || analysis ? (
                     <>
                       <BaZiDisplay
                         bazi={preliminaryBaZi.bazi}
                         mainAttribute={partialAnalysis?.mainAttribute || analysis?.mainAttribute || ''}
                          lang={lang}
                        />
                        {partialAnalysis?.basicAnalysis && !analysis && (
                          <BasicAnalysisCard
                            data={partialAnalysis.basicAnalysis}
                            lang={lang}
                            theme={theme}
                          />
                        )}
                        {partialAnalysis?.extendedAnalysis && !analysis && (
                          <ExtendedAnalysisCard
                            data={partialAnalysis.extendedAnalysis}
                            lang={lang}
                            theme={theme}
                          />
                        )}
                        {partialAnalysis?.timeline || analysis?.timeline ? (
                          <KLineChart
                            data={partialAnalysis?.timeline || analysis?.timeline || []}
                            volatilityAnalysis={partialAnalysis?.volatilityAnalysis || analysis?.volatilityAnalysis || ''}
                            lang={lang}
                            theme={theme}
                          />
                        ) : null}
                        {(analysis || partialAnalysis?.geographicDevelopment || partialAnalysis?.personality || partialAnalysis?.career || partialAnalysis?.fengShui || partialAnalysis?.wealth || partialAnalysis?.marriage) && (
                          <AnalysisSection
                            analysis={analysis || partialAnalysis}
                            lang={lang}
                            theme={theme}
                          />
                        )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <LoadingContent lang={lang} theme={theme} />
                      <AnalysisSkeleton lang={lang} theme={theme} />
                    </div>
                  )}
                </div>
              )}
              </>
        )}

        {step === 'result' && analysis && (
            <div className="animate-fade-in-up space-y-8">
                {/* BaZi Header (Read Only in result view) */}
                <BaZiDisplay bazi={analysis.bazi} mainAttribute={analysis.mainAttribute} lang={lang} />

                {/* Chart */}
                <KLineChart
                  data={analysis.timeline}
                  volatilityAnalysis={analysis.volatilityAnalysis}
                  lang={lang}
                  theme={theme}
                />

                 {/* Detailed Analysis */}
                 <AnalysisSection analysis={analysis} lang={lang} theme={theme} />
            </div>
        )}
        </div>
      </main>

      {/* Progress Bar */}
      {loading && step === 'confirmation' && (
        <ProgressBar
          progress={progress}
          step={progressStep}
          estimatedTime={estimatedTime}
          lang={lang}
          theme={theme}
        />
      )}

      {/* Simple Footer */}
      <footer className="bg-white dark:bg-white border-t border-gray-100 dark:border-amber-200 py-6 mt-auto print:hidden transition-colors duration-200" data-html2canvas-ignore="true">
        <div className="max-w-5xl mx-auto px-4 text-center text-gray-400 dark:text-gray-500 text-sm transition-colors duration-200">
            <p>&copy; {new Date().getFullYear()} {t.appTitle}. {t.footer}</p>
        </div>
      </footer>

      {/* API Quota Dialog */}
      <ApiQuotaDialog
        isOpen={showQuotaDialog}
        onClose={() => setShowQuotaDialog(false)}
        lang={lang}
        errorType={errorType}
      />

      {/* WeChat Modal */}
      <WeChatModal
        isOpen={showWeChatModal}
        onClose={() => setShowWeChatModal(false)}
      />
    </div>
  );
};

export default App;