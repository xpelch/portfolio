import React from "react";
import { useLanguage } from '@/contexts/LanguageContext';
import { Skills } from '@/types';
import SectionContainer from '@/components/ui/SectionContainer';
import SectionHeader from '@/components/ui/SectionHeader';

interface SkillsProps {
  data: Skills;
}

const SkillTag: React.FC<{ label: string }> = ({ label }) => (
  <span className="inline-flex items-center px-3 py-2 rounded-lg bg-surface-200/70 text-sm text-on-surface border border-border/30">
    {label}
  </span>
);

const sectionsOrder = [
  { key: "backend", title: "Backend", accent: "text-primary-300 border-primary-300/50 bg-primary-300/10" },
  { key: "frontend", title: "Frontend", accent: "text-secondary-200 border-secondary-200/50 bg-secondary-200/10" },
  { key: "devops", title: "DevOps", accent: "text-amber-200 border-amber-200/50 bg-amber-200/10" },
  { key: "web3", title: "Other", accent: "text-indigo-200 border-indigo-200/50 bg-indigo-200/10" },
] as const;

const SkillsSection: React.FC<SkillsProps> = ({ data }) => {
  const { translations } = useLanguage();

  return (
    <SectionContainer id="skills">
      <SectionHeader
        number="02"
        title={translations?.general?.sections?.skills || "Skills"}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sectionsOrder.map(({ key, title, accent }) => {
          const list = data[key as keyof Skills] as string[] | undefined;
          if (!list || list.length === 0) return null;

          return (
            <div
              key={key}
              className="rounded-xl border border-border/30 bg-surface-300/40 p-5 space-y-3"
            >
              <div className="flex items-center gap-2">
                <span className={`inline-flex h-2 w-2 rounded-full ${accent}`} />
                <h3 className="text-on-surface font-semibold">{title}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {list.map((skill) => (
                  <SkillTag key={skill} label={skill} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </SectionContainer>
  );
};

export default SkillsSection;

