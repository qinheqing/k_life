import React, { useState } from 'react';
import { Language } from '../types';
import { getTexts } from '../locales';
import { verifyAccessCode } from '../services/accessCodeService';
import { Key, ArrowRight, MessageCircle } from 'lucide-react';

interface AccessCodeFormProps {
  onVerified: (code: string) => void;
  lang: Language;
}

const AccessCodeForm: React.FC<AccessCodeFormProps> = ({ onVerified, lang }) => {
  const t = getTexts(lang);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showContact, setShowContact] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim()) {
      setError(lang === 'zh' ? '请输入使用码' : 'Please enter access code');
      return;
    }

    setIsLoading(true);

    try {
      const result = await verifyAccessCode(code.trim());

      if (result.valid) {
        onVerified(code.trim());
      } else {
        if (result.used) {
          setError(lang === 'zh' ? '此使用码已被使用，请联系管理员获取新码' : 'This code has been used, please contact admin for a new code');
          setShowContact(true);
        } else {
          setError(lang === 'zh' ? '使用码无效，请联系管理员' : 'Invalid access code, please contact admin');
          setShowContact(true);
        }
      }
    } catch (error) {
      setError(lang === 'zh' ? '验证失败，请稍后重试' : 'Verification failed, please try again later');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-amber-50 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-amber-200 transition-colors duration-200">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 dark:from-orange-500 dark:to-amber-500 rounded-full mb-4">
          <Key className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-800 serif mb-2 transition-colors">
          {lang === 'zh' ? '输入使用码' : 'Enter Access Code'}
        </h2>
        <p className="text-gray-500 dark:text-gray-600 text-sm transition-colors">
          {lang === 'zh' ? '请输入您获得的使用码以继续' : 'Please enter your access code to continue'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-1 transition-colors">
            {lang === 'zh' ? '使用码' : 'Access Code'}
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="XXXXXXXXXXXX"
            className="block w-full px-4 py-3 border-2 border-gray-300 dark:border-amber-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-orange-500 dark:focus:border-orange-500 dark:bg-white dark:text-gray-800 transition-colors text-center text-xl font-mono tracking-wider"
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-50 rounded-lg border border-red-200 dark:border-red-200">
            <p className="text-red-700 dark:text-red-700 text-sm font-medium transition-colors">{error}</p>
            {showContact && (
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('showWeChatModal'))}
                className="mt-2 text-sm text-purple-600 dark:text-orange-600 hover:underline font-medium transition-colors"
              >
                {lang === 'zh' ? '联系管理员获取使用码 →' : 'Contact admin for code →'}
              </button>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-orange-500 dark:to-amber-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transform transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {lang === 'zh' ? '验证中...' : 'Verifying...'}
            </>
          ) : (
            <>
              {lang === 'zh' ? '验证使用码' : 'Verify Code'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </button>

        <div className="p-4 bg-blue-50 dark:bg-amber-100 rounded-lg text-sm text-blue-700 dark:text-amber-800 border border-blue-100 dark:border-amber-300 flex items-start gap-3 transition-colors">
          <div className="mt-0.5">💡</div>
          <div>
            <p className="font-medium mb-1">
              {lang === 'zh' ? '使用码说明' : 'About Access Codes'}
            </p>
            <p>
              {lang === 'zh'
                ? '每个使用码只能使用一次。如果您没有使用码，请联系管理员获取。'
                : 'Each access code can only be used once. Please contact admin if you need a code.'}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AccessCodeForm;
