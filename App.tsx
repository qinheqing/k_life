import React, { useState, useEffect } from 'react';
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
import { UserInput, AnalysisResult, Language, BaZiResult } from './types';
import { calculateBaZi, generateDestinyAnalysis } from './services/aiService';
import { markCodeAsUsed } from './services/accessCodeService';
import { Sparkles, Languages, Moon, Sun, MessageCircle } from 'lucide-react';
import { getTexts } from './locales';

type ErrorType = 'network' | 'timeout' | 'quota' | 'server' | 'unknown';

const App: React.FC = () => {
  const [step, setStep] = useState<'landing' | 'code-entry' | 'input' | 'confirmation' | 'result'>('landing');
  const [loading, setLoading] = useState(false);
  const [showQuotaDialog, setShowQuotaDialog] = useState(false);
  const [showWeChatModal, setShowWeChatModal] = useState(false);
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
      const result = await generateDestinyAnalysis(confirmedData, lang, (progressValue, stepText, time) => {
        setProgress(progressValue);
        setProgressStep(stepText);
        setEstimatedTime(time);
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
      <div className="min-h-screen font-sans">
        {/* Minimal Header for Landing */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-teal-500 text-white p-1.5 rounded-lg">
                  <Sparkles size={18} />
              </div>
              <div>
                  <h1 className="font-bold text-gray-900 text-lg leading-none">{t.appTitle}</h1>
                  <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">AI Destiny Analysis</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
               {/* WeChat Button */}
               <button
                  onClick={() => setShowWeChatModal(true)}
                  className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  title="Contact via WeChat"
               >
                  <MessageCircle size={16} />
               </button>

               {/* Theme Toggle */}
               <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
               >
                  {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
               </button>

               {/* Language Toggle */}
               <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors"
               >
                  <Languages size={14} className="hidden sm:inline" />
                  <span className="hidden sm:inline">{lang === 'en' ? '中文' : 'English'}</span>
                  <span className="sm:hidden">{lang === 'en' ? 'CN' : 'EN'}</span>
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
    <div className="min-h-screen bg-gray-50 dark:bg-amber-50 flex flex-col font-sans transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-white border-b border-gray-200 dark:border-amber-200 sticky top-0 z-40 transition-colors duration-200 print:hidden" data-html2canvas-ignore="true">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
            <div className="bg-black dark:bg-amber-600 text-white p-1.5 rounded-lg transition-colors">
                <Sparkles size={18} />
            </div>
            <div>
                <h1 className="font-bold text-gray-900 dark:text-gray-800 text-lg leading-none transition-colors">{t.appTitle}</h1>
                <p className="text-[10px] text-gray-500 dark:text-gray-600 font-medium tracking-wider uppercase transition-colors">AI Destiny Analysis</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
             {/* WeChat Button */}
             <button
                onClick={() => setShowWeChatModal(true)}
                className="p-2 rounded-full bg-gray-100 dark:bg-amber-100 text-gray-600 dark:text-gray-700 hover:bg-gray-200 dark:hover:bg-amber-200 transition-colors"
                title="Contact via WeChat"
             >
                <MessageCircle size={16} />
             </button>

             {/* Theme Toggle */}
             <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-100 dark:bg-amber-100 text-gray-600 dark:text-gray-700 hover:bg-gray-200 dark:hover:bg-amber-200 transition-colors"
                title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
             >
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
             </button>

             {/* Language Toggle */}
             <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-amber-100 hover:bg-gray-200 dark:hover:bg-amber-200 text-gray-700 dark:text-gray-800 text-xs font-medium transition-colors"
             >
                <Languages size={14} className="hidden sm:inline" />
                <span className="hidden sm:inline">{lang === 'en' ? '中文' : 'English'}</span>
                <span className="sm:hidden">{lang === 'en' ? 'CN' : 'EN'}</span>
             </button>

             {step !== 'input' && (
                <button
                    onClick={handleReset}
                    className="text-sm font-medium text-gray-500 dark:text-gray-600 hover:text-purple-600 dark:hover:text-orange-600 transition-colors ml-1 hidden sm:flex items-center"
                >
                    ← <span className="ml-1">{t.newReading}</span>
                </button>
             )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-10 max-w-5xl">
        {step === 'code-entry' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
            <AccessCodeForm onVerified={handleAccessCodeVerified} lang={lang} />
          </div>
        )}

        {step === 'input' && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
                {/* Hero Section */}
                <div className="text-center mb-12 max-w-3xl">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-800 mb-2 transition-colors duration-200">
                        {t.heroTitle1}
                    </h2>
                    <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 dark:from-orange-500 dark:to-amber-500 bg-clip-text text-transparent mb-6 transition-all duration-200">
                        {t.heroTitle2}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-700 text-base md:text-lg leading-relaxed transition-colors duration-200">
                        {t.heroDescription}
                    </p>
                </div>

                <InputForm onSubmit={handleInitialSubmit} isLoading={loading} lang={lang} />
            </div>
        )}

        {step === 'confirmation' && preliminaryBaZi && (
             <BaZiConfirmation 
                data={preliminaryBaZi}
                onConfirm={handleBaZiConfirm}
                onRetry={() => setStep('input')}
                lang={lang}
                isLoading={loading}
             />
        )}

        {step === 'result' && analysis && (
            <div className="animate-fade-in space-y-8">
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