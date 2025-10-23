import React from "react";
import { useLanguage } from '@/contexts/LanguageContext';
import { GeneralData } from '@/types';

interface HeaderProps {
  data: GeneralData;
}

const Header: React.FC<HeaderProps> = ({ data }) => {
  const { translations } = useLanguage();
  
  return (
    <div className="space-y-8 pt-8 sm:pt-0">
      <div className="space-y-4">
        <div className="inline-block">
          <span className="text-primary-400 text-sm font-medium tracking-widest uppercase">
            {translations?.general?.greeting?.hello || "Bonjour, je suis"}
          </span>
        </div>
        <h1 className="text-6xl lg:text-7xl font-bold text-on-surface leading-tight">
          {data.name}
        </h1>
        <h2 className="text-xl lg:text-2xl text-text-secondary font-light leading-relaxed max-w-2xl">
          {data.headline}
        </h2>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <a 
          href="#about" 
          className="inline-flex items-center justify-center px-8 py-4 bg-primary-400 text-on-surface font-medium rounded-xl hover:bg-primary-300 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
        >
          {translations?.general?.buttons?.discoverWork || "Découvrir mon travail"}
        </a>
        <a 
          href="#projects" 
          className="inline-flex items-center justify-center px-8 py-4 border-2 border-border text-on-surface font-medium rounded-xl hover:border-primary-400 hover:text-primary-400 transition-all duration-300 hover:scale-105"
        >
          {translations?.general?.buttons?.viewProjects || "Voir mes projets"}
        </a>
      </div>
    </div>
  );
};

export default Header;
