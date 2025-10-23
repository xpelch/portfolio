import React from "react";
import { useLanguage } from '@/contexts/LanguageContext';
import { GeneralData } from '@/types';
import SectionContainer from '@/components/ui/SectionContainer';
import SectionHeader from '@/components/ui/SectionHeader';

interface AboutProps {
  data: GeneralData;
}

const About: React.FC<AboutProps> = ({ data }) => {
  const { translations } = useLanguage();
  
  return (
    <SectionContainer id='about'>
      <SectionHeader 
        number="01" 
        title={translations?.general?.sections?.about || "À propos"} 
      />
      
      <div className='text-text-secondary text-base lg:text-lg leading-relaxed space-y-6'>
        {data.about.map((paragraph, index) => (
          <p key={index} className='leading-relaxed'>
            {paragraph}
          </p>
        ))}
      </div>
    </SectionContainer>
  );
};

export default About;
