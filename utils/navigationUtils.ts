import { Translations } from '@/types';

export const getNavigationName = (key: string, translations: Translations): string => {
  const navigationMap: Record<string, string> = {
    about: translations?.general?.navigation?.about || "À propos",
    experiences: translations?.general?.navigation?.experiences || "Expériences",
    education: translations?.general?.navigation?.education || "Formation",
    projects: translations?.general?.navigation?.projects || "Projets",
  };
  return navigationMap[key] || "";
};
