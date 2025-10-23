'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import BackgroundDecorations from '@/components/ui/BackgroundDecorations';
import HeroSection from '@/components/ui/HeroSection';
import ContentSections from '@/components/ui/ContentSections';

export default function Home() {
  const { translations, loading } = useLanguage();

  if (loading || !translations) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-surface-100 via-surface-200 to-surface-300">
      <BackgroundDecorations />
      
      <div className="relative z-10">
        <HeroSection generalData={translations.general} />
        <ContentSections translations={translations} />
      </div>
    </div>
  );
}
