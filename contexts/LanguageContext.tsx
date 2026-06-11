'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Translations } from '@/types';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  translations: Translations | null;
  loading: boolean;
  languageNotice: 'recovered' | null;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [translations, setTranslations] = useState<Translations | null>(null);
  const [loading, setLoading] = useState(true);
  const [languageNotice, setLanguageNotice] = useState<'recovered' | null>(null);

  const loadTranslations = async (lang: Language) => {
    const response = await fetch(`/translations/${lang}.json`);
    if (!response.ok) {
      throw new Error(`translation_${lang}_unavailable`);
    }
    return response.json() as Promise<Translations>;
  };

  const setLanguage = async (lang: Language) => {
    try {
      const data = await loadTranslations(lang);
      setLanguageState(lang);
      localStorage.setItem('portfolio-language', lang);
      setTranslations(data);
      setLanguageNotice(null);
    } catch (error) {
      console.error('Failed to load translations:', error);
      setLanguageNotice('recovered');
    }
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('portfolio-language');
    const initialLanguage: Language = savedLanguage === 'fr' || savedLanguage === 'en' ? savedLanguage : 'en';
    if (savedLanguage && savedLanguage !== initialLanguage) {
      localStorage.setItem('portfolio-language', initialLanguage);
      setLanguageNotice('recovered');
    }
    setLanguageState(initialLanguage);
    
    const loadInitialTranslations = async () => {
      try {
        const data = await loadTranslations(initialLanguage);
        setTranslations(data);
      } catch (error) {
        console.error('Failed to load translations:', error);
        const fallbackData = await loadTranslations('en');
        setLanguageState('en');
        localStorage.setItem('portfolio-language', 'en');
        setTranslations(fallbackData);
        setLanguageNotice('recovered');
      } finally {
        setLoading(false);
      }
    };

    loadInitialTranslations();
  }, []);

  const value = {
    language,
    setLanguage,
    translations,
    loading,
    languageNotice,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
