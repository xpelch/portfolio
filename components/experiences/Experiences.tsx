import React from "react";
import ExperienceItem from "./ExperienceItem";
import { useLanguage } from '@/contexts/LanguageContext';
import { Experience, ExperienceSummary } from '@/types';
import SectionContainer from '@/components/ui/SectionContainer';
import SectionHeader from '@/components/ui/SectionHeader';

interface ExperiencesProps {
  data: Experience[];
  summary?: ExperienceSummary;
}

const Experiences: React.FC<ExperiencesProps> = ({ data, summary }) => {
  const { translations } = useLanguage();
  
  return (
    <SectionContainer id='experiences'>
      <SectionHeader 
        number="03" 
        title={translations?.general?.sections?.experiences || "Expériences"} 
      />

      {summary && (
        <div className="mb-8 p-4 rounded-xl border border-border/30 bg-surface-300/30">
          <h3 className="text-on-surface font-semibold mb-3">{summary.title}</h3>
          <ul className="list-disc list-inside space-y-2 text-text-secondary">
            {summary.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

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
