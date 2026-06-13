'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { CommandDeck, type CommandDeckItem } from '@/components/home/CommandDeck';
import { FooterLinks } from '@/components/home/FooterLinks';
import { ArrowIcon, ExternalIcon, SectionLabel, StackTable } from '@/components/home/HomePrimitives';
import { ProjectCard } from '@/components/home/ProjectCard';
import {
  commandTriggerClassName,
  contactCopyButtonClassName,
  contactPrimaryLinkClassName,
  heroPrimaryLinkClassName,
  heroProfileLinkClassName,
  heroSecondaryLinkClassName,
  heroSectionClassName,
  heroTitleClassName,
  languageRecoveryButtonClassName,
  languageRecoveryNoticeClassName,
  sectionGithubLinkClassName,
  timelineArticleClassName,
} from '@/components/home/homeClassNames';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useTypingLoop } from '@/hooks/useTypingLoop';
import { useVisitCounter } from '@/hooks/useVisitCounter';
import { recordJourneyEvent } from '@/lib/journey-events';
import type { Translations } from '@/types';
import { copyTextToClipboard } from '@/utils/clipboard';

const modes = [
  { key: 'ship', en: 'ship', fr: 'livrer' },
  { key: 'stabilize', en: 'stabilize', fr: 'stabiliser' },
  { key: 'automate', en: 'automate', fr: 'automatiser' },
  { key: 'learn', en: 'learn', fr: 'apprendre' },
] as const;

function isFrench(translations: Translations) {
  return translations.general.greeting.hello.toLowerCase().includes('bonjour');
}

export default function Home() {
  const { translations, loading, language, setLanguage, languageNotice } = useLanguage();
  const [commandOpen, setCommandOpen] = useState(false);
  const [contactCopyStatus, setContactCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const commandTriggerRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const contactCopyResetRef = useRef<number | null>(null);
  const visitCount = useVisitCounter();

  const copy = useMemo(() => {
    if (!translations) return null;
    const fr = isFrench(translations);
    return {
      fr,
      nav: {
        projects: fr ? 'Travaux' : 'Work',
        about: fr ? 'Profil' : 'Profile',
        stack: 'Stack',
        experience: fr ? 'Expérience' : 'Experience',
      },
      intro: fr
        ? "comprendre. construire. tester. améliorer."
        : 'understand. build. test. improve.',
      sub: fr
        ? "Développeur full-stack spécialisé en applications web de production, automatisation et workflows AI utiles."
        : 'Full-stack developer focused on production web apps, automation, and useful AI workflows.',
      terminalMessages: fr
        ? ['> construire, vérifier, apprendre...', '> cadrer, construire, valider...', '> livrer, mesurer, améliorer...']
        : ['> build, verify, learn...', '> frame, build, validate...', '> ship, measure, improve...'],
      recent: fr ? 'Travaux récents' : 'Recent work',
      allProjects: fr ? 'Voir les projets' : 'View projects',
      aboutHand: fr ? 'curieux, autonome et rigoureux' : 'curious, autonomous and proof-oriented',
      stackNote: fr ? 'et toujours plus à apprendre...' : 'and always more to learn...',
      contactTitle: fr ? 'Dispo pour de nouveaux projets' : 'Available for new projects',
      contactBody: fr
        ? 'Discutons de ton idée, de tes contraintes ou de la release à stabiliser.'
        : 'Send the idea, constraints, or release that needs to ship cleanly.',
      copyEmail: fr ? 'Copier email' : 'Copy email',
      contactCopied: fr ? 'Email copié' : 'Email copied',
      contactCopyFailed: fr ? 'Email visible' : 'Email visible',
      languageRecoveryTitle: fr ? 'Langue récupérée' : 'Language recovered',
      languageRecoveryBody: fr
        ? "Les textes ont été rechargés dans une langue disponible."
        : 'Text loaded in an available language after a saved preference failed.',
      languageRecoveryAction: fr ? 'Passer en anglais' : 'Try French',
      commandTitle: fr ? 'OPERATOR DECK' : 'OPERATOR DECK',
      commandStatus: fr ? 'Chemins rapides pour évaluer le travail.' : 'Fast paths for evaluating the work.',
      heroStatus: 'Canada / Remote US',
      visitLabel: fr ? 'passage' : 'trace',
      visitTitle: fr ? 'Compteur local de passage' : 'Local visit counter',
      note: fr ? ['idée', 'construire', 'valider', 'livrer'] : ['idea', 'build', 'validate', 'ship'],
      labels: {
        role: fr ? 'ROLE' : 'ROLE',
        constraint: fr ? 'CONTRAINTE' : 'CONSTRAINT',
        outcome: fr ? 'IMPACT' : 'OUTCOME',
        proof: fr ? 'PREUVE' : 'PROOF',
        private: fr ? 'Cas privé' : 'Private case study',
        open: fr ? 'Projet public' : 'Open project',
      },
      modes: modes.map((mode) => (fr ? mode.fr : mode.en)),
    };
  }, [translations]);

  const terminalText = useTypingLoop(copy?.terminalMessages ?? []);

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

  const copyContactEmail = useCallback(async (source: string) => {
    if (!translations) return;
    if (contactCopyResetRef.current !== null) {
      window.clearTimeout(contactCopyResetRef.current);
    }

    try {
      await copyTextToClipboard(translations.general.socials.email);
      setContactCopyStatus('copied');
      recordJourneyEvent('contact_copy', source);
    } catch {
      setContactCopyStatus('failed');
      recordJourneyEvent('contact_copy', `${source}:failed`);
    }

    contactCopyResetRef.current = window.setTimeout(() => {
      setContactCopyStatus('idle');
      contactCopyResetRef.current = null;
    }, 2400);
  }, [translations]);

  useEffect(() => () => {
    if (contactCopyResetRef.current !== null) {
      window.clearTimeout(contactCopyResetRef.current);
    }
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

  if (loading || !translations || !copy) {
    return <LoadingSpinner />;
  }

  const featuredProjects = translations.projects.slice(0, 3);
  const remainingProject = translations.projects[3];
  const proofPoints = translations.general.proofPoints ?? [];
  const operator = translations.general.operatorSignal;
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const commandItems: CommandDeckItem[] = [
    {
      key: 'work',
      label: copy.fr ? 'Inspecter les travaux' : 'Inspect work',
      meta: '#projects',
      action: () => scrollToSection('projects'),
    },
    {
      key: 'contact',
      label: copy.fr ? 'Démarrer le contact' : 'Start contact',
      meta: 'mailto',
      action: () => {
        recordJourneyEvent('contact_click', 'command-deck');
        window.location.href = `mailto:${translations.general.socials.email}`;
      },
    },
    {
      key: 'operator',
      label: copy.fr ? 'Lire la boucle opérateur' : 'Read operator loop',
      meta: '#about',
      action: () => scrollToSection('about'),
    },
    {
      key: 'github',
      label: 'GitHub',
      meta: 'external',
      action: () => {
        recordJourneyEvent('external_profile_click', 'github');
        window.open(translations.general.socials.github, '_blank', 'noopener,noreferrer');
      },
    },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      meta: 'external',
      action: () => {
        recordJourneyEvent('external_profile_click', 'linkedin');
        window.open(translations.general.socials.linkedin, '_blank', 'noopener,noreferrer');
      },
    },
    {
      key: 'language',
      label: language === 'fr' ? 'Switch to English' : 'Passer en français',
      meta: language === 'fr' ? 'EN' : 'FR',
      action: () => {
        const nextLanguage = language === 'fr' ? 'en' : 'fr';
        recordJourneyEvent('language_switch', nextLanguage);
        setLanguage(nextLanguage);
      },
    },
  ];

  return (
    <main className="paper-noise min-h-screen overflow-hidden bg-surface-100 text-on-background">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-6 border-b border-border pb-5">
          <a href="#top" className="group flex items-center gap-4" aria-label="Back to top">
            <span className="serif-display text-3xl font-bold leading-none text-secondary-300">XP</span>
            <span className="mono-copy hidden text-[0.68rem] font-semibold tracking-[0.22em] text-on-surface sm:block">
              XAVIER PELCHAT
            </span>
          </a>
          <nav className="mono-copy hidden items-center gap-9 text-sm text-text-secondary md:flex" aria-label="Primary navigation">
            <a className="inline-flex min-h-6 items-center hover:text-on-surface" href="#projects">{copy.nav.projects}</a>
            <a className="inline-flex min-h-6 items-center hover:text-on-surface" href="#about">{copy.nav.about}</a>
            <a className="inline-flex min-h-6 items-center hover:text-on-surface" href="#stack">{copy.nav.stack}</a>
            <a className="inline-flex min-h-6 items-center hover:text-on-surface" href="#experience">{copy.nav.experience}</a>
          </nav>
          <a
            href={`mailto:${translations.general.socials.email}`}
            className="mono-copy border border-secondary-300/70 px-4 py-3 text-xs text-secondary-300 transition hover:bg-secondary-300 hover:text-surface-100"
            onClick={() => recordJourneyEvent('contact_click', 'header')}
          >
            {translations.general.buttons.getInTouch}
          </a>
        </header>

        {languageNotice === 'recovered' && (
          <div
            role="status"
            data-proof="language-recovery"
            className={languageRecoveryNoticeClassName}
          >
            <div>
              <p className="mono-copy text-xs tracking-[0.14em] text-secondary-300">{copy.languageRecoveryTitle}</p>
              <p className="mt-2 max-w-2xl leading-6">{copy.languageRecoveryBody}</p>
            </div>
            <button
              type="button"
              data-proof="language-recovery-action"
              className={languageRecoveryButtonClassName}
              onClick={() => {
                void setLanguage(language === 'fr' ? 'en' : 'fr');
              }}
            >
              {copy.languageRecoveryAction}
            </button>
          </div>
        )}

        <section id="top" className={heroSectionClassName}>
          <div className="space-y-6 sm:space-y-9">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-secondary-300">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12 12.3a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6Z" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span className="mono-copy text-xs text-text-secondary">{translations.general.location}</span>
              </div>
              <span className="hidden h-px w-8 bg-border sm:block" />
              <span className="mono-copy text-xs text-text-secondary">{copy.heroStatus}</span>
            </div>
            <div className="space-y-5 sm:space-y-7">
              <h1 className={heroTitleClassName}>
                {translations.general.name}
              </h1>
              <div className="space-y-4 sm:space-y-5">
                <p className="text-xl font-semibold leading-tight text-secondary-300 sm:text-3xl">
                  {translations.general.role}
                </p>
                <div className="h-px w-20 bg-secondary-300" />
                <p className="max-w-xl text-xl leading-tight text-on-surface sm:text-3xl">
                  {translations.general.headline}
                </p>
                <p className="max-w-xl text-base leading-7 text-text-secondary">{copy.sub}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="#projects"
                className={heroPrimaryLinkClassName}
              >
                {translations.general.buttons.viewProjects}
                <ArrowIcon />
              </a>
              <a
                href={`mailto:${translations.general.socials.email}`}
                className={heroSecondaryLinkClassName}
                onClick={() => recordJourneyEvent('contact_click', 'hero')}
              >
                {translations.general.buttons.emailMe}
                <ArrowIcon />
              </a>
              <a
                href={translations.general.socials.github}
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
              {copy.intro}
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
                <p className="handwritten text-2xl leading-tight">{copy.note[0]}</p>
                <ul className="mono-copy mt-2 space-y-1 text-sm">
                  {copy.note.slice(1).map((item) => (
                    <li key={item} className="whitespace-nowrap">&gt; {item}</li>
                  ))}
                </ul>
              </div>
              <div
                className="absolute -left-2 bottom-10 z-20 rotate-[-8deg] border border-secondary-300/55 bg-surface-100/92 px-3 py-2 shadow-xl sm:-left-7"
                aria-label={`${copy.visitTitle}: ${visitCount ?? 1}`}
                data-proof="visit-counter"
                title={copy.visitTitle}
              >
                <span className="mono-copy block text-[0.58rem] uppercase tracking-[0.16em] text-text-muted">{copy.visitLabel}</span>
                <span className="serif-display block text-2xl leading-none text-secondary-300">
                  {String(visitCount ?? 1).padStart(2, '0')}
                </span>
              </div>
            </div>

            <button
              ref={commandTriggerRef}
              type="button"
              onClick={openCommandDeck}
              className={commandTriggerClassName}
              aria-label={copy.fr ? 'Ouvrir le deck opérateur' : 'Open operator deck'}
              data-proof="command-deck-trigger"
            >
              <span className="inline-block max-w-[36ch] overflow-hidden whitespace-nowrap" aria-live="polite">{terminalText}</span>
              <span className="h-4 w-2 animate-pulse bg-on-surface" />
            </button>
          </div>
        </section>

        <section id="projects" data-section className="py-14">
          <div className="mb-8 flex items-end justify-between gap-5">
            <SectionLabel>{copy.recent}</SectionLabel>
            <a
              href={translations.general.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className={sectionGithubLinkClassName}
              onClick={() => recordJourneyEvent('external_profile_click', 'github-projects')}
            >
              {copy.allProjects}
              <ArrowIcon />
            </a>
          </div>

          <div className="grid gap-7 lg:grid-cols-3">
            {featuredProjects.map((project, index) => (
              <ProjectCard key={project.name} project={project} index={index} labels={copy.labels} />
            ))}
          </div>
          {remainingProject && (
            <p className="handwritten ml-auto mt-6 max-w-xs rotate-[-2deg] text-xl text-text-secondary">
              {copy.fr ? 'du concret, pas du bruit.' : 'proof over promises.'}
            </p>
          )}
        </section>

        <section id="experience" data-section className="border-y border-border py-16">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <SectionLabel>{translations.general.sections.experiences}</SectionLabel>
              <h2 className="mt-5 max-w-md text-4xl font-semibold leading-tight text-on-surface">
                {copy.fr
                  ? 'des produits utiles, livrés de façon méthodique'
                  : 'useful products, shipped with discipline'}
              </h2>
            </div>
            <div className="space-y-6">
              {translations.experiences.map((experience) => (
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
            <SectionLabel>{translations.general.sections.about}</SectionLabel>
            <h2 className="handwritten max-w-2xl text-4xl leading-tight text-on-surface sm:text-5xl">
              {copy.aboutHand}
            </h2>
            <div className="grid gap-5 text-base leading-7 text-text-secondary md:grid-cols-2">
              {translations.general.about.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

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

        <section id="stack" data-section className="grid gap-12 py-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionLabel>{translations.general.sections.skills}</SectionLabel>
            <h2 className="mt-5 max-w-md text-4xl font-semibold leading-tight text-on-surface">
              {translations.experienceSummary.title}
            </h2>
            <ul className="mt-8 space-y-4 text-text-secondary">
              {translations.experienceSummary.bullets.map((bullet) => (
                <li key={bullet} className="grid grid-cols-[1.25rem_1fr] gap-3">
                  <span className="mt-3 h-px bg-secondary-300" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-7">
            <StackTable translations={translations} />
            <p className="handwritten text-2xl text-text-secondary">{copy.stackNote}</p>
          </div>
        </section>

        <section id="contact" data-section className="grid gap-10 border-t border-border py-14 md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-6">
            <SectionLabel>{copy.contactTitle}</SectionLabel>
            <p className="mt-4 max-w-md text-text-secondary">{copy.contactBody}</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start">
              <a
                href={`mailto:${translations.cta.email}`}
                className={contactPrimaryLinkClassName}
                onClick={() => recordJourneyEvent('contact_click', 'contact-section')}
              >
                {translations.cta.buttonText}
                <ArrowIcon />
              </a>
              <div className="flex flex-col">
                <button
                  type="button"
                  data-proof="contact-copy"
                  aria-describedby="contact-copy-status"
                  className={contactCopyButtonClassName}
                  onClick={() => copyContactEmail('contact-section')}
                >
                  {contactCopyStatus === 'copied'
                    ? copy.contactCopied
                    : contactCopyStatus === 'failed'
                      ? copy.contactCopyFailed
                      : copy.copyEmail}
                </button>
                <span
                  id="contact-copy-status"
                  data-proof="contact-copy-status"
                  aria-live="polite"
                  className="mono-copy mt-1 min-h-4 max-w-[24rem] text-[0.68rem] text-secondary-300"
                >
                  {contactCopyStatus === 'idle'
                    ? ''
                    : contactCopyStatus === 'copied'
                      ? copy.contactCopied
                      : translations.general.socials.email}
                </span>
              </div>
            </div>
          </div>

          <FooterLinks isFrench={copy.fr} socials={translations.general.socials} />
        </section>
      </div>
      <CommandDeck
        open={commandOpen}
        onClose={closeCommandDeck}
        title={copy.commandTitle}
        status={copy.commandStatus}
        closeLabel={copy.fr ? 'Fermer le deck opérateur' : 'Close operator deck'}
        commands={commandItems}
      />
    </main>
  );
}
