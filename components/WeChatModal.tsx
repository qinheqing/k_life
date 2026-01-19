import React from 'react';

interface WeChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WeChatModal: React.FC<WeChatModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"></div>

      {/* Modal Content */}
      <div
        className="relative bg-white dark:bg-amber-50 rounded-2xl shadow-2xl p-8 max-w-sm w-full animate-scale-in transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-700 transition-colors duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-800 mb-2 transition-colors duration-200">
            扫码添加微信
          </h3>
          <p className="text-gray-600 dark:text-gray-700 mb-6 transition-colors duration-200">
            Scan QR Code to Add WeChat
          </p>

          {/* QR Code */}
          <div className="bg-gray-100 dark:bg-amber-100 rounded-xl p-6 mb-4 transition-colors duration-200">
            <div className="w-56 h-56 mx-auto bg-white dark:bg-white rounded-lg flex items-center justify-center p-4">
              <img
                src="/doc/wechat-qr.png"
                alt="WeChat QR Code"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-600 transition-colors duration-200">
            @heqing
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeChatModal;
