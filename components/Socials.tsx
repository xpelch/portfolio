import React from "react";
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

interface SocialsProps {
  data: {
    email: string;
    linkedin: string;
    github: string;
  };
}

const Socials: React.FC<SocialsProps> = ({ data }) => {
  const { translations } = useLanguage();
  
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-medium text-text-secondary uppercase tracking-widest">
        Contact
      </h3>
      
      <div className="space-y-4">
        <a 
          href={`mailto:${data.email}`} 
          className="group flex items-center p-4 bg-primary-400/10 hover:bg-primary-400/20 rounded-xl border border-primary-400/20 hover:border-primary-400/40 transition-all duration-300 hover:scale-105"
        >
          <div className="w-10 h-10 bg-primary-400/20 rounded-lg flex items-center justify-center mr-4 group-hover:bg-primary-400/30 transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-primary-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <div>
            <div className="font-medium text-on-surface">{translations?.general?.buttons?.getInTouch || "Me contacter"}</div>
            <div className="text-sm text-text-secondary">{data.email}</div>
          </div>
        </a>
        
        <div className="flex gap-4">
          <a 
            href={data.github} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group flex items-center justify-center w-12 h-12 bg-surface-300/50 hover:bg-surface-300/80 rounded-xl border border-border/20 hover:border-primary-400/40 transition-all duration-300 hover:scale-110"
          >
            <Image 
              src="/logos/github-mark-white.png" 
              alt="GitHub Logo" 
              width={20} 
              height={20} 
              className="opacity-70 group-hover:opacity-100 transition-opacity duration-300" 
            />
          </a>
          <a 
            href={data.linkedin} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group flex items-center justify-center w-12 h-12 bg-surface-300/50 hover:bg-surface-300/80 rounded-xl border border-border/20 hover:border-primary-400/40 transition-all duration-300 hover:scale-110"
          >
            <Image 
              src="/logos/linkedin-mark-white.png" 
              alt="LinkedIn Logo" 
              width={20} 
              height={20} 
              className="opacity-70 group-hover:opacity-100 transition-opacity duration-300" 
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Socials;
