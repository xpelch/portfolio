'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <div className="mono-copy flex overflow-hidden border border-border bg-surface-100/90 text-xs shadow-2xl">
        {(['en', 'fr'] as const).map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setLanguage(code)}
            className={`px-3 py-2 transition ${
              language === code
                ? 'bg-secondary-300 text-surface-100'
                : 'text-text-secondary hover:bg-surface-300 hover:text-on-surface'
            }`}
            aria-pressed={language === code}
            aria-label={code === 'en' ? 'Switch to English' : 'Passer au français'}
          >
            {code.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
