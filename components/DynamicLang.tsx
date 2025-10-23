'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const DynamicLang: React.FC = () => {
  const { language } = useLanguage();

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return null;
};

export default DynamicLang;
