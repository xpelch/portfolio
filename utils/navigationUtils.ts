import { Translations } from '@/types';

export const getNavigationName = (key: string, translations: Translations): string => {
  const navigationMap: Record<string, string> = {
    about: translations?.general?.navigation?.about || "À propos",
    skills: translations?.general?.navigation?.skills || "Compétences",
    experiences: translations?.general?.navigation?.experiences || "Expériences",
    education: translations?.general?.navigation?.education || "Formation",
    projects: translations?.general?.navigation?.projects || "Projets",
    contact: translations?.general?.navigation?.contact || "Contact",
  };
  return navigationMap[key] || "";
};
