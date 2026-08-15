'use client';

import Image from 'next/image';
import type { RefObject } from 'react';
import type { Translations } from '@/types';
import { ArrowIcon, ExternalIcon } from '@/components/home/HomePrimitives';
import {
  commandTriggerClassName,
  heroPrimaryLinkClassName,
  heroProfileLinkClassName,
  heroSecondaryLinkClassName,
  heroSectionClassName,
  heroTitleClassName,
} from '@/components/home/homeClassNames';
import { recordJourneyEvent } from '@/lib/journey-events';

type HeroSectionProps = {
  translations: Translations;
  visitCount: number | null;
  terminalText: string;
  commandTriggerRef: RefObject<HTMLButtonElement | null>;
  onOpenCommandDeck: () => void;
};

export function HeroSection({
  translations,
  visitCount,
  terminalText,
  commandTriggerRef,
  onOpenCommandDeck,
}: HeroSectionProps) {
  const { general, home } = translations;
  const proofPoints = general.proofPoints ?? [];

  return (
    <section id="top" className={heroSectionClassName}>
      <div className="space-y-6 sm:space-y-9">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-secondary-300">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 12.3a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6Z" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="mono-copy text-xs text-text-secondary">{general.location}</span>
          </div>
          <span className="hidden h-px w-8 bg-border sm:block" />
          <span className="mono-copy text-xs text-text-secondary">{general.availability ?? 'Remote'}</span>
        </div>
        <div className="space-y-5 sm:space-y-7">
          <h1 className={heroTitleClassName}>
            {general.name}
          </h1>
          <div className="space-y-4 sm:space-y-5">
            <p className="text-xl font-semibold leading-tight text-secondary-300 sm:text-3xl">
              {general.role}
            </p>
            <div className="h-px w-20 bg-secondary-300" />
            <p className="max-w-xl text-xl leading-tight text-on-surface sm:text-3xl">
              {general.headline}
            </p>
            <p className="max-w-xl text-base leading-7 text-text-secondary">{home.sub}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            href="#projects"
            className={heroPrimaryLinkClassName}
          >
            {general.buttons.viewProjects}
            <ArrowIcon />
          </a>
          <a
            href={`mailto:${general.socials.email}`}
            className={heroSecondaryLinkClassName}
            onClick={() => recordJourneyEvent('contact_click', 'hero')}
          >
            {general.buttons.emailMe}
            <ArrowIcon />
          </a>
          <a
            href={general.socials.github}
            target="_blank"
            rel="noopener noreferrer"
            className={heroProfileLinkClassName}
            onClick={() => recordJourneyEvent('external_profile_click', 'github')}
          >
            GitHub
            <ExternalIcon />
          </a>
        </div>

        <div className="grid max-w-2xl gap-3 border-y border-border py-5 sm:grid-cols-3">
          {proofPoints.map((point) => (
            <div key={point.label}>
              <p className="mono-copy text-[0.68rem] tracking-[0.12em] text-text-muted">{point.label}</p>
              <p className="mt-2 text-sm text-on-background">{point.value}</p>
            </div>
          ))}
        </div>

        <p className="handwritten max-w-sm rotate-[-2deg] text-xl leading-7 text-secondary-300">
          {home.intro}
        </p>
      </div>

      <div className="relative mx-auto w-full max-w-xl lg:mr-0">
        <div className="relative overflow-visible">
          <div className="absolute left-1/2 top-0 z-20 h-8 w-28 -translate-x-1/2 -rotate-2 bg-secondary-300/28" />
          <div className="origin-center scale-105 sm:scale-110">
            <Image
              src="/images/developer-workspace-cutout.png"
              alt="Black and white developer workspace with a laptop and notebook"
              width={980}
              height={980}
              priority
              className="aspect-[3/2] w-full object-contain"
            />
          </div>
          <div className="absolute -right-2 bottom-5 z-20 w-40 rotate-[-3deg] bg-secondary-300 p-4 text-surface-100 shadow-2xl sm:-right-8">
            <p className="handwritten text-2xl leading-tight">{home.note[0]}</p>
            <ul className="mono-copy mt-2 space-y-1 text-sm">
              {home.note.slice(1).map((item) => (
                <li key={item} className="whitespace-nowrap">&gt; {item}</li>
              ))}
            </ul>
          </div>
          <div
            className="absolute -left-2 bottom-10 z-20 rotate-[-8deg] border border-secondary-300/55 bg-surface-100/92 px-3 py-2 shadow-xl sm:-left-7"
            aria-label={`${home.visitTitle}: ${visitCount ?? 1}`}
            data-proof="visit-counter"
            title={home.visitTitle}
          >
            <span className="mono-copy block text-[0.58rem] uppercase tracking-[0.16em] text-text-muted">{home.visitLabel}</span>
            <span className="serif-display block text-2xl leading-none text-secondary-300">
              {String(visitCount ?? 1).padStart(2, '0')}
            </span>
          </div>
        </div>

        <button
          ref={commandTriggerRef}
          type="button"
          onClick={onOpenCommandDeck}
          className={commandTriggerClassName}
          aria-label={home.commandTriggerLabel}
          data-proof="command-deck-trigger"
        >
          <span className="inline-block max-w-[36ch] overflow-hidden whitespace-nowrap" aria-live="polite">{terminalText}</span>
          <span className="h-4 w-2 animate-pulse bg-on-surface" />
        </button>
      </div>
    </section>
  );
}
