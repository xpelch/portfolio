import React from "react";
import EducationItem from "./EducationItem";
import { useLanguage } from '@/contexts/LanguageContext';
import { type Education } from '@/types';
import SectionContainer from '@/components/ui/SectionContainer';
import SectionHeader from '@/components/ui/SectionHeader';

interface EducationProps {
  data: Education[];
}

const Education: React.FC<EducationProps> = ({ data }) => {
  const { translations } = useLanguage();
  
  return (
    <SectionContainer id='education'>
      <SectionHeader 
        number="04" 
        title={translations?.general?.sections?.education || "Formation"} 
      />
      
      <div className="space-y-8">
        {data.map((education) => (
          <EducationItem
            key={`${education.subject}+${education.startDate}`}
            subject={education.subject}
            degree={education.degree}
            university={education.university}
            href={education.href}
            startDate={education.startDate}
            endDate={education.endDate}
            description={education.description}
          />
        ))}
      </div>
    </SectionContainer>
  );
};

export default Education;
