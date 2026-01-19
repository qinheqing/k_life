import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ApiQuotaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'zh' | 'en';
}

const ApiQuotaDialog: React.FC<ApiQuotaDialogProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  const texts = {
    zh: {
      title: 'API 额度暂时耗尽',
      message: '非常抱歉，目前 API 调用额度已经用完啦！',
      note: '作者正在想办法尽快恢复 API 额度，请稍后再过来看看吧~',
      suggestion: '您可以：',
      option1: '稍后再试（预计很快会恢复）',
      option2: '关注项目获取最新更新',
      closeButton: '知道了',
    },
    en: {
      title: 'API Quota Temporarily Exhausted',
      message: 'Sorry, the API quota has been exhausted for now!',
      note: 'The developer is working hard to restore the API quota. Please check back later~',
      suggestion: 'You can:',
      option1: 'Try again later (should be restored soon)',
      option2: 'Follow the project for latest updates',
      closeButton: 'Got it',
    }
  };

  const t = texts[lang];

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
          <div className="p-3 bg-orange-100 dark:bg-orange-200 rounded-full transition-colors duration-200">
            <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-700 transition-colors duration-200" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-800 mb-2 transition-colors duration-200">
            {t.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-700 mb-3 transition-colors duration-200">
            {t.message}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-600 italic transition-colors duration-200">
            {t.note}
          </p>
        </div>

        {/* Suggestions */}
        <div className="bg-gray-50 dark:bg-amber-100 rounded-xl p-4 mb-6 transition-colors duration-200">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-800 mb-2 transition-colors duration-200">
            {t.suggestion}
          </p>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-purple-500 dark:text-orange-600 mt-0.5">•</span>
              <span>{t.option1}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 dark:text-orange-600 mt-0.5">•</span>
              <span>{t.option2}</span>
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
