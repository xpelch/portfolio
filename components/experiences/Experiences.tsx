import React from "react";
import ExperienceItem from "./ExperienceItem";
import { useLanguage } from '@/contexts/LanguageContext';
import { Experience } from '@/types';
import SectionContainer from '@/components/ui/SectionContainer';
import SectionHeader from '@/components/ui/SectionHeader';

interface ExperiencesProps {
  data: Experience[];
}

const Experiences: React.FC<ExperiencesProps> = ({ data }) => {
  const { translations } = useLanguage();
  
  return (
    <SectionContainer id='experiences'>
      <SectionHeader 
        number="02" 
        title={translations?.general?.sections?.experiences || "Expériences"} 
      />
      
      <div className="space-y-8">
        {data.map((experience) => (
          <ExperienceItem
            key={`${experience.title}+${experience.startDate}`}
            title={experience.title}
            company={experience.company}
            href={experience.href}
            startDate={experience.startDate}
            endDate={experience.endDate}
            description={experience.description}
            logo={experience.logo}
            skills={experience.skills}
          />
        ))}
      </div>
    </SectionContainer>
  );
};

export default Experiences;
