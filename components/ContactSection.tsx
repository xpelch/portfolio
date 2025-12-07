import React from "react";
import { CTA, GeneralData } from '@/types';
import SectionContainer from '@/components/ui/SectionContainer';
import SectionHeader from '@/components/ui/SectionHeader';

interface ContactSectionProps {
  general: GeneralData;
  cta: CTA;
}

const ContactSection: React.FC<ContactSectionProps> = ({ general, cta }) => {
  return (
    <SectionContainer id="contact">
      <SectionHeader 
        number="06" 
        title={general.sections.contact || "Contact"} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-2xl font-semibold text-on-surface">{cta.title}</h3>
          <p className="text-text-secondary text-lg">{cta.subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <a
              href={`mailto:${cta.email}`}
              className="inline-flex items-center px-5 py-3 rounded-xl bg-primary-400 text-on-surface font-medium hover:bg-primary-300 transition-all duration-300 hover:scale-105"
            >
              {cta.buttonText}
            </a>
            <a
              href={general.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-3 rounded-xl border border-border text-on-surface hover:border-primary-400 hover:text-primary-400 transition-all duration-300 hover:scale-105"
            >
              LinkedIn
            </a>
            <a
              href={general.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-3 rounded-xl border border-border text-on-surface hover:border-primary-400 hover:text-primary-400 transition-all duration-300 hover:scale-105"
            >
              GitHub
            </a>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-surface-300/40 border border-border/30">
            <div className="text-sm text-text-secondary">Email</div>
            <a href={`mailto:${general.socials.email}`} className="text-on-surface font-medium break-words">
              {general.socials.email}
            </a>
          </div>
          <div className="p-4 rounded-xl bg-surface-300/40 border border-border/30">
            <div className="text-sm text-text-secondary">LinkedIn</div>
            <a href={general.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-on-surface font-medium">
              {general.socials.linkedin.replace(/^https?:\/\//, '')}
            </a>
          </div>
          <div className="p-4 rounded-xl bg-surface-300/40 border border-border/30">
            <div className="text-sm text-text-secondary">GitHub</div>
            <a href={general.socials.github} target="_blank" rel="noopener noreferrer" className="text-on-surface font-medium">
              {general.socials.github.replace(/^https?:\/\//, '')}
            </a>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
};

export default ContactSection;

