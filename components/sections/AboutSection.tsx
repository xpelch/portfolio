'use client';

import Image from 'next/image';
import type { Translations } from '@/types';
import { ExternalIcon, SectionLabel } from '@/components/home/HomePrimitives';

export function AboutSection({ translations }: { translations: Translations }) {
  const { general, home, education } = translations;
  const primaryEducation = education[0];
  const operator = general.operatorSignal;

  return (
    <section id="about" data-section className="grid gap-12 py-16 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="relative max-w-sm">
        <div className="absolute left-10 top-0 z-10 h-8 w-28 -rotate-3 bg-on-surface/18" />
        <div className="rotate-[-3deg] border border-border bg-surface-200 p-3 shadow-2xl">
          <Image
            src="/images/profile-shoreline.jpg"
            alt="Person standing by a rocky shoreline in a quiet reset moment"
            width={520}
            height={620}
            loading="eager"
            className="aspect-[4/5] w-full object-cover object-center"
          />
        </div>
        <p className="handwritten mt-7 max-w-48 -rotate-6 text-xl leading-7 text-text-secondary">
          reset. focus. ship.
        </p>
      </div>

      <div className="space-y-8">
        <SectionLabel>{general.sections.about}</SectionLabel>
        <h2 className="handwritten max-w-2xl text-4xl leading-tight text-on-surface sm:text-5xl">
          {home.aboutHand}
        </h2>
        <div className="grid gap-5 text-base leading-7 text-text-secondary md:grid-cols-2">
          {general.about.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {primaryEducation && (
          <div className="border-y border-border py-6">
            <div className="grid gap-5 sm:grid-cols-[9rem_1fr]">
              <div>
                <SectionLabel>{general.sections.education}</SectionLabel>
                <p className="mono-copy mt-3 text-xs text-text-muted">
                  {primaryEducation.startDate} — {primaryEducation.endDate}
                </p>
              </div>
              <div>
                <a
                  href={primaryEducation.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-lg font-semibold text-on-surface transition-colors hover:text-secondary-300"
                >
                  {primaryEducation.degree} · {primaryEducation.subject}
                  <ExternalIcon />
                </a>
                <p className="mt-1 text-secondary-300">{primaryEducation.university}</p>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
                  {primaryEducation.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {operator && (
          <div className="border-y border-border py-6">
            <div className="grid gap-5 lg:grid-cols-[12rem_1fr]">
              <div>
                <h3 className="mono-copy text-sm text-secondary-300">{operator.title}</h3>
                <p className="mt-3 text-sm leading-6 text-text-secondary">{operator.description}</p>
              </div>
              <ol className="grid gap-2 sm:grid-cols-2">
                {operator.steps.map((step, index) => (
                  <li key={step} className="min-w-0 border border-border px-3 py-3">
                    <span className="mono-copy block text-[0.68rem] text-text-muted">0{index + 1}</span>
                    <span className="mt-2 block whitespace-nowrap text-sm leading-5 text-on-background">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
