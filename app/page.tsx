'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { CommandDeck, type CommandDeckItem } from '@/components/home/CommandDeck';
import {
  languageRecoveryButtonClassName,
  languageRecoveryNoticeClassName,
} from '@/components/home/homeClassNames';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useTypingLoop } from '@/hooks/useTypingLoop';
import { useVisitCounter } from '@/hooks/useVisitCounter';
import { recordJourneyEvent } from '@/lib/journey-events';
import { HeroSection } from '@/components/sections/HeroSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { ExperienceSection } from '@/components/sections/ExperienceSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { StackSection } from '@/components/sections/StackSection';
import { ContactSection } from '@/components/sections/ContactSection';

export default function Home() {
  const { translations, loading, language, setLanguage, languageNotice } = useLanguage();
  const [commandOpen, setCommandOpen] = useState(false);
  const commandTriggerRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const visitCount = useVisitCounter();

  const terminalText = useTypingLoop(translations?.home.terminalMessages ?? []);

  const openCommandDeck = useCallback(() => {
    lastFocusedElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : commandTriggerRef.current;
    setCommandOpen(true);
  }, []);

  const closeCommandDeck = useCallback(() => {
    setCommandOpen(false);
    window.setTimeout(() => {
      (lastFocusedElementRef.current ?? commandTriggerRef.current)?.focus({ preventScroll: true });
    }, 0);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTextEntry =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable;

      if (event.key === 'Escape') {
        closeCommandDeck();
        return;
      }

      if (event.key === '/' && !event.altKey && !event.ctrlKey && !event.metaKey && !isTextEntry) {
        event.preventDefault();
        openCommandDeck();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeCommandDeck, openCommandDeck]);

  if (loading || !translations) {
    return <LoadingSpinner />;
  }

  const { general, home } = translations;
  const isFrench = language === 'fr';
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const commandItems: CommandDeckItem[] = [
    {
      key: 'work',
      label: home.commandWorkLabel,
      meta: '#projects',
      action: () => scrollToSection('projects'),
    },
    {
      key: 'contact',
      label: home.commandContactLabel,
      meta: 'mailto',
      action: () => {
        recordJourneyEvent('contact_click', 'command-deck');
        window.location.href = `mailto:${general.socials.email}`;
      },
    },
    {
      key: 'operator',
      label: home.commandOperatorLabel,
      meta: '#about',
      action: () => scrollToSection('about'),
    },
    {
      key: 'github',
      label: 'GitHub',
      meta: 'external',
      action: () => {
        recordJourneyEvent('external_profile_click', 'github');
        window.open(general.socials.github, '_blank', 'noopener,noreferrer');
      },
    },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      meta: 'external',
      action: () => {
        recordJourneyEvent('external_profile_click', 'linkedin');
        window.open(general.socials.linkedin, '_blank', 'noopener,noreferrer');
      },
    },
    {
      key: 'language',
      label: home.commandLanguageLabel,
      meta: isFrench ? 'EN' : 'FR',
      action: () => {
        const nextLanguage = isFrench ? 'en' : 'fr';
        recordJourneyEvent('language_switch', nextLanguage);
        setLanguage(nextLanguage);
      },
    },
  ];

  return (
    <main className="paper-noise min-h-screen overflow-hidden bg-surface-100 text-on-background">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-6 border-b border-border pb-5">
          <a
            href="#top"
            className="group mono-copy inline-flex min-h-9 items-center text-sm font-semibold tracking-[0.06em]"
            aria-label={home.backToTop}
          >
            <span aria-hidden="true">
              <span className="text-secondary-300 transition group-hover:text-secondary-400">$</span>
              <span className="ml-2 text-on-surface transition group-hover:text-secondary-300">cd ~/</span>
            </span>
          </a>
          <nav className="mono-copy hidden items-center gap-9 text-sm text-text-secondary md:flex" aria-label="Primary navigation">
            <a className="inline-flex min-h-6 items-center hover:text-on-surface" href="#projects">{home.nav.projects}</a>
            <a className="inline-flex min-h-6 items-center hover:text-on-surface" href="#about">{home.nav.about}</a>
            <a className="inline-flex min-h-6 items-center hover:text-on-surface" href="#stack">{home.nav.stack}</a>
            <a className="inline-flex min-h-6 items-center hover:text-on-surface" href="#experience">{home.nav.experience}</a>
          </nav>
          <a
            href={`mailto:${general.socials.email}`}
            className="mono-copy border border-secondary-300/70 px-4 py-3 text-xs text-secondary-300 transition hover:bg-secondary-300 hover:text-surface-100"
            onClick={() => recordJourneyEvent('contact_click', 'header')}
          >
            {general.buttons.getInTouch}
          </a>
        </header>

        {languageNotice === 'recovered' && (
          <div
            role="status"
            data-proof="language-recovery"
            className={languageRecoveryNoticeClassName}
          >
            <div>
              <p className="mono-copy text-xs tracking-[0.14em] text-secondary-300">{home.languageRecoveryTitle}</p>
              <p className="mt-2 max-w-2xl leading-6">{home.languageRecoveryBody}</p>
            </div>
            <button
              type="button"
              data-proof="language-recovery-action"
              className={languageRecoveryButtonClassName}
              onClick={() => {
                void setLanguage(isFrench ? 'en' : 'fr');
              }}
            >
              {home.languageRecoveryAction}
            </button>
          </div>
        )}

        <HeroSection
          translations={translations}
          visitCount={visitCount}
          terminalText={terminalText}
          commandTriggerRef={commandTriggerRef}
          onOpenCommandDeck={openCommandDeck}
        />

        <ProjectsSection translations={translations} />
        <ExperienceSection translations={translations} />
        <AboutSection translations={translations} />
        <StackSection translations={translations} />
        <ContactSection translations={translations} />
      </div>
      <CommandDeck
        open={commandOpen}
        onClose={closeCommandDeck}
        title={home.commandTitle}
        status={home.commandStatus}
        closeLabel={home.commandCloseLabel}
        commands={commandItems}
      />
    </main>
  );
}
