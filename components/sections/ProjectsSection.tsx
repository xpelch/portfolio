'use client';

import type { Translations } from '@/types';
import { ProjectCard } from '@/components/home/ProjectCard';
import { ArrowIcon, SectionLabel } from '@/components/home/HomePrimitives';
import { sectionGithubLinkClassName } from '@/components/home/homeClassNames';
import { recordJourneyEvent } from '@/lib/journey-events';

export function ProjectsSection({ translations }: { translations: Translations }) {
  const { general, home, projects } = translations;
  const featuredProjects = projects.slice(0, 3);
  const remainingProject = projects[3];

  return (
    <section id="projects" data-section className="py-14">
      <div className="mb-8 flex items-end justify-between gap-5">
        <SectionLabel>{home.recent}</SectionLabel>
        <a
          href={general.socials.github}
          target="_blank"
          rel="noopener noreferrer"
          className={sectionGithubLinkClassName}
          onClick={() => recordJourneyEvent('external_profile_click', 'github-projects')}
        >
          {home.allProjects}
          <ArrowIcon />
        </a>
      </div>

      <div className="grid gap-7 lg:grid-cols-3">
        {featuredProjects.map((project, index) => (
          <ProjectCard key={project.name} project={project} index={index} labels={home.labels} />
        ))}
      </div>
      {remainingProject && (
        <p className="handwritten ml-auto mt-6 max-w-xs rotate-[-2deg] text-xl text-text-secondary">
          {home.projectsNote}
        </p>
      )}
    </section>
  );
}
