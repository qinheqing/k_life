import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Language } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  lang: Language;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, lang }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-[10vh] animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl max-h-[80vh] bg-white dark:bg-amber-50 rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col"
      >
        <div className="flex-shrink-0 bg-white dark:bg-amber-50 border-b border-gray-200 dark:border-amber-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-700">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-amber-200 transition-colors cursor-pointer"
              aria-label={lang === 'zh' ? '关闭' : 'Close'}
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-600 group-hover:text-gray-700 dark:group-hover:text-gray-800 transition-colors" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto overflow-x-hidden p-6 custom-scrollbar" style={{ height: 'calc(80vh - 88px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
