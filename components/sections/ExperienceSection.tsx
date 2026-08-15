'use client';

import type { Translations } from '@/types';
import { SectionLabel } from '@/components/home/HomePrimitives';
import { timelineArticleClassName } from '@/components/home/homeClassNames';

export function ExperienceSection({ translations }: { translations: Translations }) {
  const { general, home, experiences } = translations;

  return (
    <section id="experience" data-section className="border-y border-border py-16">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <SectionLabel>{general.sections.experiences}</SectionLabel>
          <h2 className="mt-5 max-w-md text-4xl font-semibold leading-tight text-on-surface">
            {home.experienceHeading}
          </h2>
        </div>
        <div className="space-y-6">
          {experiences.map((experience) => (
            <article
              key={`${experience.company}-${experience.startDate}`}
              className={timelineArticleClassName}
            >
              <div className="mono-copy text-xs text-text-muted">
                {experience.startDate}<br />{experience.endDate}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-on-surface">{experience.title}</h3>
                <p className="mt-1 text-secondary-300">{experience.company}</p>
                <p className="mt-4 text-sm leading-6 text-text-secondary">{experience.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {experience.skills.map((skill) => (
                    <span key={skill} className="mono-copy border border-border px-2 py-1 text-[0.68rem] text-text-secondary">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
