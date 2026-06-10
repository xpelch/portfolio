'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { recordJourneyEvent } from '@/lib/journey-events';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed right-5 top-40 z-50 md:bottom-5 md:top-auto" data-proof="language-switcher">
      <div className="mono-copy flex overflow-hidden border border-border bg-surface-100/90 text-xs shadow-2xl">
        {(['en', 'fr'] as const).map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => {
              recordJourneyEvent('language_switch', code);
              setLanguage(code);
            }}
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
