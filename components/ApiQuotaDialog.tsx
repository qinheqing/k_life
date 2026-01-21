import React from 'react';
import { AlertCircle, X, Wifi, Clock, ServerCrash } from 'lucide-react';

type ErrorType = 'network' | 'timeout' | 'quota' | 'server' | 'unknown';

interface ApiQuotaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'zh' | 'en';
  errorType?: ErrorType;
}

const ApiQuotaDialog: React.FC<ApiQuotaDialogProps> = ({ isOpen, onClose, lang, errorType = 'quota' }) => {
  if (!isOpen) return null;

  const texts = {
    zh: {
      quota: {
        title: 'API 额度暂时耗尽',
        message: '非常抱歉，目前 API 调用额度已经用完啦！',
        note: '作者正在想办法尽快恢复 API 额度，请稍后再过来看看吧~',
        suggestion: '您可以：',
        option1: '稍后再试（预计很快会恢复）',
        option2: '关注项目获取最新更新',
      },
      network: {
        title: '网络连接失败',
        message: '哎呀，网络好像出问题了，无法连接到服务器~',
        note: '请检查您的网络连接是否正常，然后重试。',
        suggestion: '您可以：',
        option1: '检查网络连接后重试',
        option2: '切换到更稳定的网络环境',
      },
      timeout: {
        title: '请求超时',
        message: '哎呀，服务器响应太慢了，请求超时啦~',
        note: '可能是服务器负载较高，请稍后再试。',
        suggestion: '您可以：',
        option1: '稍后再试（预计几分钟内恢复）',
        option2: '检查网络连接是否稳定',
      },
      server: {
        title: '服务器错误',
        message: '哎呀，服务器遇到了一些问题，无法完成请求~',
        note: '我们已经记录了这个问题，会尽快修复。',
        suggestion: '您可以：',
        option1: '稍后再试（我们正在紧急修复）',
        option2: '联系开发者反馈问题',
      },
      unknown: {
        title: '分析失败',
        message: '哎呀，分析过程中出现了未知错误~',
        note: '请稍后再试，或者联系开发者反馈问题。',
        suggestion: '您可以：',
        option1: '稍后再试',
        option2: '联系开发者反馈问题',
      },
      closeButton: '知道了',
    },
    en: {
      quota: {
        title: 'API Quota Temporarily Exhausted',
        message: 'Sorry, the API quota has been exhausted for now!',
        note: 'The developer is working hard to restore the API quota. Please check back later~',
        suggestion: 'You can:',
        option1: 'Try again later (should be restored soon)',
        option2: 'Follow the project for latest updates',
      },
      network: {
        title: 'Network Connection Failed',
        message: 'Oops, there seems to be a network issue, unable to connect to the server~',
        note: 'Please check your network connection and try again.',
        suggestion: 'You can:',
        option1: 'Check network connection and retry',
        option2: 'Switch to a more stable network',
      },
      timeout: {
        title: 'Request Timeout',
        message: 'Oops, the server response is too slow, request timed out~',
        note: 'The server might be under heavy load, please try again later.',
        suggestion: 'You can:',
        option1: 'Try again later (should recover soon)',
        option2: 'Check if network connection is stable',
      },
      server: {
        title: 'Server Error',
        message: 'Oops, the server encountered an issue and cannot complete the request~',
        note: 'We have logged this issue and will fix it as soon as possible.',
        suggestion: 'You can:',
        option1: 'Try again later (we are fixing it)',
        option2: 'Contact the developer to report the issue',
      },
      unknown: {
        title: 'Analysis Failed',
        message: 'Oops, an unknown error occurred during analysis~',
        note: 'Please try again later or contact the developer to report the issue.',
        suggestion: 'You can:',
        option1: 'Try again later',
        option2: 'Contact the developer to report the issue',
      },
      closeButton: 'Got it',
    }
  };

  const t = texts[lang];
  const errorContent = t[errorType];

  const getIcon = () => {
    switch (errorType) {
      case 'network':
        return <Wifi className="w-8 h-8 text-red-600 dark:text-red-700" />;
      case 'timeout':
        return <Clock className="w-8 h-8 text-orange-600 dark:text-orange-700" />;
      case 'server':
        return <ServerCrash className="w-8 h-8 text-red-600 dark:text-red-700" />;
      case 'quota':
        return <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-700" />;
      default:
        return <AlertCircle className="w-8 h-8 text-gray-600 dark:text-gray-700" />;
    }
  };

  const getBgColor = () => {
    switch (errorType) {
      case 'network':
      case 'server':
        return 'bg-red-100 dark:bg-red-200';
      case 'timeout':
        return 'bg-orange-100 dark:bg-orange-200';
      case 'quota':
        return 'bg-orange-100 dark:bg-orange-200';
      default:
        return 'bg-gray-100 dark:bg-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 print:hidden" style={{ animation: 'fadeIn 0.3s ease-in-out' }} data-html2canvas-ignore="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className="relative bg-white dark:bg-amber-50 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all transition-colors duration-200"
        style={{ animation: 'scaleIn 0.2s ease-out' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-amber-100 transition-colors duration-200"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className={`p-3 ${getBgColor()} rounded-full transition-colors duration-200`}>
            {getIcon()}
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-800 mb-2 transition-colors duration-200">
            {errorContent.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-700 mb-3 transition-colors duration-200">
            {errorContent.message}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-600 italic transition-colors duration-200">
            {errorContent.note}
          </p>
        </div>

        {/* Suggestions */}
        <div className="bg-gray-50 dark:bg-amber-100 rounded-xl p-4 mb-6 transition-colors duration-200">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-800 mb-2 transition-colors duration-200">
            {errorContent.suggestion}
          </p>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-purple-500 dark:text-orange-600 mt-0.5">•</span>
              <span>{errorContent.option1}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 dark:text-orange-600 mt-0.5">•</span>
              <span>{errorContent.option2}</span>
            </li>
          </ul>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-500 dark:from-orange-500 dark:to-amber-500 hover:from-purple-700 hover:to-blue-600 dark:hover:from-orange-600 dark:hover:to-amber-600 text-white font-medium rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {t.closeButton}
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default ApiQuotaDialog;
