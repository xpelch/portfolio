'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

type JourneyEvent = {
  name: 'language_switch';
  target: string;
  at: string;
};

function recordLanguageSwitch(target: string) {
  if (typeof window === 'undefined') return;

  const event: JourneyEvent = { name: 'language_switch', target, at: new Date().toISOString() };
  const portfolioWindow = window as Window & { __portfolioJourneyEvents?: JourneyEvent[] };
  portfolioWindow.__portfolioJourneyEvents = [...(portfolioWindow.__portfolioJourneyEvents ?? []), event];
  window.dispatchEvent(new CustomEvent('portfolio:journey', { detail: event }));
}

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
              recordLanguageSwitch(code);
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
