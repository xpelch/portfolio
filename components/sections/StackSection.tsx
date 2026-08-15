'use client';

import type { Translations } from '@/types';
import { SectionLabel, StackTable } from '@/components/home/HomePrimitives';

export function StackSection({ translations }: { translations: Translations }) {
  const { general, home, experienceSummary } = translations;

  return (
    <section id="stack" data-section className="grid gap-12 py-16 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <SectionLabel>{general.sections.skills}</SectionLabel>
        <h2 className="mt-5 max-w-md text-4xl font-semibold leading-tight text-on-surface">
          {experienceSummary.title}
        </h2>
        <ul className="mt-8 space-y-4 text-text-secondary">
          {experienceSummary.bullets.map((bullet) => (
            <li key={bullet} className="grid grid-cols-[1.25rem_1fr] gap-3">
              <span className="mt-3 h-px bg-secondary-300" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-7">
        <StackTable translations={translations} />
        <p className="handwritten text-2xl text-text-secondary">{home.stackNote}</p>
      </div>
    </section>
  );
}
