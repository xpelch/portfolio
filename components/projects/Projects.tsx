import React from "react";
import ProjectItem from "./ProjectItem";
import { useLanguage } from '@/contexts/LanguageContext';
import { Project } from '@/types';
import SectionContainer from '@/components/ui/SectionContainer';
import SectionHeader from '@/components/ui/SectionHeader';

interface ProjectsProps {
  data: Project[];
}

const Projects: React.FC<ProjectsProps> = ({ data }) => {
  const { translations } = useLanguage();
  
  return (
    <SectionContainer id='projects'>
      <SectionHeader 
        number="05" 
        title={translations?.general?.sections?.projects || "Projets"} 
      />
      
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {data.map((project, index) => (
          <ProjectItem
            key={project.name}
            name={project.name}
            stars={project.stars}
            lib={project.framework}
            description={project.description}
            href={project.href}
            className={index === 0 ? 'md:col-span-2' : ''}
          />
        ))}
      </div>
    </SectionContainer>
  );
};

export default Projects;
