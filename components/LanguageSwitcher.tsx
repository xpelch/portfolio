'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
] as const;

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === language);

  const handleLanguageChange = async (langCode: 'en' | 'fr') => {
    await setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-surface-200 border border-border rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-400"
          aria-label="Change language"
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">{currentLanguage?.flag}</span>
            <span className="text-sm font-medium hidden sm:block">{currentLanguage?.name}</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {isOpen && (
          <div className="absolute bottom-full right-0 mb-2 w-48 bg-surface-200 border border-border rounded-lg shadow-xl overflow-hidden z-60">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLanguageChange(lang.code);
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  handleLanguageChange(lang.code);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-surface-300 active:bg-surface-300 transition-colors duration-150 flex items-center space-x-3 touch-manipulation ${
                  language === lang.code ? 'bg-surface-300' : ''
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="text-sm font-medium">{lang.name}</span>
                {language === lang.code && (
                  <svg className="w-4 h-4 ml-auto text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 sm:hidden"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default LanguageSwitcher;
