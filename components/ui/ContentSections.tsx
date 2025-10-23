import React from 'react';
import About from '@/components/About';
import Education from '@/components/education/Education';
import Experiences from '@/components/experiences/Experiences';
import Projects from '@/components/projects/Projects';
import { Translations } from '@/types';

interface ContentSectionsProps {
  translations: Translations;
}

const ContentSections: React.FC<ContentSectionsProps> = ({ translations }) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pb-16">
      <About data={translations.general} />
      <Experiences data={translations.experiences} />
      <Education data={translations.education} />
      <Projects data={translations.projects} />
    </div>
  );
};

export default ContentSections;
