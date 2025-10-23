'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translations: any;
  loading: boolean;
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
  const [translations, setTranslations] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('portfolio-language', lang);
    
    try {
      const response = await fetch(`/translations/${lang}.json`);
      const data = await response.json();
      setTranslations(data);
    } catch (error) {
      console.error('Failed to load translations:', error);
    }
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('portfolio-language') as Language || 'en';
    setLanguageState(savedLanguage);
    
    const loadTranslations = async () => {
      try {
        const response = await fetch(`/translations/${savedLanguage}.json`);
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error('Failed to load translations:', error);
        const fallbackResponse = await fetch('/translations/en.json');
        const fallbackData = await fallbackResponse.json();
        setTranslations(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    loadTranslations();
  }, []);

  const value = {
    language,
    setLanguage,
    translations,
    loading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
