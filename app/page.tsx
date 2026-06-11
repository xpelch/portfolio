'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { recordJourneyEvent } from '@/lib/journey-events';
import type { Project, Translations } from '@/types';

const modes = [
  { key: 'ship', en: 'ship', fr: 'livrer' },
  { key: 'stabilize', en: 'stabilize', fr: 'stabiliser' },
  { key: 'automate', en: 'automate', fr: 'automatiser' },
  { key: 'learn', en: 'learn', fr: 'apprendre' },
] as const;

function useTypingLoop(messages: string[]) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [visibleLength, setVisibleLength] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setReducedMotion(media.matches);
    syncPreference();
    media.addEventListener('change', syncPreference);
    return () => media.removeEventListener('change', syncPreference);
  }, []);

  useEffect(() => {
    if (reducedMotion || messages.length === 0) return;

    const current = messages[messageIndex] ?? '';
    const isComplete = visibleLength === current.length;
    const isEmpty = visibleLength === 0;
    const delay = isComplete && !deleting ? 1050 : deleting ? 34 : 58;

    const timeout = window.setTimeout(() => {
      if (!deleting && isComplete) {
        setDeleting(true);
        return;
      }

      if (deleting && isEmpty) {
        setDeleting(false);
        setMessageIndex((index) => (index + 1) % messages.length);
        return;
      }

      setVisibleLength((length) => length + (deleting ? -1 : 1));
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [deleting, messageIndex, messages, reducedMotion, visibleLength]);

  if (messages.length === 0) return '';
  if (reducedMotion) return messages[0];

  return (messages[messageIndex] ?? '').slice(0, visibleLength);
}

function isFrench(translations: Translations) {
  return translations.general.greeting.hello.toLowerCase().includes('bonjour');
}

function useVisitCounter() {
  const [visitCount, setVisitCount] = useState<number | null>(null);

  useEffect(() => {
    const storageKey = 'portfolio-visit-ledger';
    const sessionKey = 'portfolio-visit-counted';
    let timeout: number | null = null;
    const updateCount = (count: number) => {
      timeout = window.setTimeout(() => setVisitCount(count), 0);
    };

    try {
      const storedCount = Number.parseInt(window.localStorage.getItem(storageKey) ?? '0', 10);
      const currentCount = Number.isFinite(storedCount) ? Math.max(0, storedCount) : 0;
      const hasCountedThisSession = window.sessionStorage.getItem(sessionKey) === 'true';
      const nextCount = hasCountedThisSession ? currentCount || 1 : Math.min(currentCount + 1, 999);

      if (!hasCountedThisSession) {
        window.localStorage.setItem(storageKey, String(nextCount));
        window.sessionStorage.setItem(sessionKey, 'true');
      }

      updateCount(nextCount);
    } catch {
      updateCount(1);
    }

    return () => {
      if (timeout !== null) window.clearTimeout(timeout);
    };
  }, []);

  return visitCount;
}

async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);
  if (!copied) throw new Error('copy_failed');
}

function ArrowIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 8h8v8M16 8 7 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mono-copy text-xs tracking-[0.18em] text-text-secondary">{'//'} {children}</p>;
}

function ProjectVisual({ project, index }: { project: Project; index: number }) {
  const lanes = project.stack?.slice(0, 4) ?? [project.framework];
  return (
    <div className="relative h-44 overflow-hidden border-b border-border bg-surface-100 p-4">
      <div className="absolute inset-0 opacity-70">
        <div className="h-full w-full bg-[linear-gradient(90deg,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(206,190,83,0.12)_1px,transparent_1px),linear-gradient(180deg,rgba(206,190,83,0.10)_1px,transparent_1px)] bg-[size:32px_32px,32px_32px,128px_128px,128px_128px]" />
      </div>
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="mono-copy text-[0.68rem] text-text-muted">case.0{index + 1}</div>
            <div className="max-w-48 text-xl font-semibold leading-tight text-on-surface">{project.name}</div>
          </div>
          <div className="h-8 w-8 border border-secondary-300/70 text-secondary-300">
            <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path d="M16 4v24M4 16h24M8 8l16 16M24 8 8 24" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {lanes.map((lane) => (
            <div key={lane} className="mono-copy border border-border bg-surface-200/80 px-2 py-1 text-[0.66rem] text-text-secondary">
              {lane}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  index,
  labels,
}: {
  project: Project;
  index: number;
  labels: { role: string; constraint: string; outcome: string; proof: string; private: string; open: string };
}) {
  const isPrivate = project.href === '#';
  const cardClassName = `scrap-card group block overflow-hidden transition duration-300 ${
    isPrivate ? 'cursor-default' : 'hover:-translate-y-1 hover:border-secondary-300/70'
  }`;
  const cardBody = (
    <>
      <ProjectVisual project={project} index={index} />
      <div className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="mono-copy text-xs text-secondary-300">{project.framework}</p>
            <h3 className="mt-2 text-2xl font-semibold leading-tight text-on-surface">{project.name}</h3>
          </div>
          <span className="mono-copy whitespace-nowrap border border-border px-2 py-1 text-[0.68rem] text-text-secondary">
            {project.stars}
          </span>
        </div>
        <p className="text-sm leading-6 text-text-secondary">{project.description}</p>
        <dl className="space-y-3 border-t border-border pt-4 text-sm">
          {project.role && (
            <div data-proof="project-role">
              <dt className="mono-copy text-[0.68rem] tracking-[0.12em] text-text-muted">{labels.role}</dt>
              <dd className="mt-1 text-on-background">{project.role}</dd>
            </div>
          )}
          {project.constraint && (
            <div data-proof="project-constraint">
              <dt className="mono-copy text-[0.68rem] tracking-[0.12em] text-text-muted">{labels.constraint}</dt>
              <dd className="mt-1 text-text-secondary">{project.constraint}</dd>
            </div>
          )}
          {project.outcome && (
            <div>
              <dt className="mono-copy text-[0.68rem] tracking-[0.12em] text-text-muted">{labels.outcome}</dt>
              <dd className="mt-1 text-on-background">{project.outcome}</dd>
            </div>
          )}
          {project.proof && (
            <div>
              <dt className="mono-copy text-[0.68rem] tracking-[0.12em] text-text-muted">{labels.proof}</dt>
              <dd className="mt-1 text-text-secondary">{project.proof}</dd>
            </div>
          )}
        </dl>
        <div className="flex items-center gap-2 text-sm font-medium text-secondary-300">
          <span>{project.href === '#' ? labels.private : labels.open}</span>
          {project.href !== '#' && <ExternalIcon />}
        </div>
      </div>
    </>
  );

  if (isPrivate) {
    return (
      <article
        className={cardClassName}
        aria-label={`${project.name}: ${project.description}`}
        data-proof="project-card"
        data-project-state="private"
      >
        {cardBody}
      </article>
    );
  }

  return (
    <a
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cardClassName}
      aria-label={`${project.name}: ${project.description}`}
      data-proof="project-card"
      data-project-state="public"
      onClick={() => recordJourneyEvent('project_open', project.name)}
    >
      {cardBody}
    </a>
  );
}

function StackTable({ translations }: { translations: Translations }) {
  const lanes = [
    ['Backend', translations.skills.backend],
    ['Frontend', translations.skills.frontend],
    ['DevOps', translations.skills.devops],
    ['Agentic', translations.skills.agentic ?? []],
    ['Web3', translations.skills.web3 ?? []],
  ] as const;

  return (
    <div className="border-y border-border">
      {lanes.map(([title, items]) => (
        <div key={title} className="grid gap-4 border-b border-border py-4 last:border-b-0 md:grid-cols-[9rem_1fr]">
          <h3 className="mono-copy text-sm text-text-secondary">{title}</h3>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {items.map((item) => (
              <span key={item} className="text-sm text-on-background">{item}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

type CommandDeckItem = {
  key: string;
  label: string;
  meta: string;
  action: () => void;
};

function CommandDeck({
  open,
  onClose,
  title,
  status,
  closeLabel,
  commands,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  status: string;
  closeLabel: string;
  commands: CommandDeckItem[];
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const commandRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (!open) return;
    const focusTimer = window.setTimeout(() => commandRefs.current[0]?.focus(), 0);
    return () => window.clearTimeout(focusTimer);
  }, [open]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== 'Tab') return;
    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') ?? [],
    ).filter((element) => !element.hasAttribute('disabled'));

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-surface-100/82 px-4 py-8" role="presentation" onMouseDown={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-deck-title"
        aria-describedby="command-deck-status"
        data-proof="command-deck"
        className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-hidden border border-border bg-surface-200 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-4 sm:p-5">
          <div>
            <p id="command-deck-title" className="mono-copy text-xs tracking-[0.16em] text-secondary-300">
              {title}
            </p>
            <p id="command-deck-status" className="mt-2 text-sm text-text-secondary">{status}</p>
          </div>
          <button
            type="button"
            aria-label={closeLabel}
            data-proof="command-deck-close"
            onClick={onClose}
            className="mono-copy inline-flex min-h-10 min-w-10 items-center justify-center border border-border text-xs text-text-secondary transition hover:border-secondary-300 hover:text-secondary-300 focus-visible:border-secondary-300 focus-visible:text-secondary-300"
          >
            ESC
          </button>
        </div>
        <div className="max-h-[min(30rem,calc(100dvh-10rem))] divide-y divide-border overflow-y-auto">
          {commands.map((command, index) => (
            <button
              key={command.key}
              ref={(node) => {
                commandRefs.current[index] = node;
              }}
              type="button"
              onClick={() => {
                command.action();
                onClose();
              }}
              className="group grid w-full gap-2 px-4 py-4 text-left transition hover:bg-surface-300 focus-visible:bg-surface-300 sm:grid-cols-[1fr_auto] sm:px-5"
            >
              <span className="font-semibold text-on-surface group-hover:text-secondary-300">{command.label}</span>
              <span className="mono-copy text-xs text-text-muted">{command.meta}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { translations, loading, language, setLanguage } = useLanguage();
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

        <section id="top" className="relative grid min-h-[calc(100dvh-6rem)] items-start gap-10 py-6 sm:gap-12 sm:py-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-14">
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
              <h1 className="serif-display max-w-3xl text-5xl font-bold leading-[0.96] text-on-surface sm:text-7xl md:whitespace-nowrap lg:text-[4.75rem] xl:text-[5.6rem] 2xl:text-8xl">
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
                className="mono-copy inline-flex items-center justify-center gap-3 border border-on-surface px-6 py-4 text-sm text-on-surface transition hover:bg-on-surface hover:text-surface-100"
              >
                {translations.general.buttons.viewProjects}
                <ArrowIcon />
              </a>
              <a
                href={`mailto:${translations.general.socials.email}`}
                className="mono-copy inline-flex items-center justify-center gap-3 border border-secondary-300 px-6 py-4 text-sm text-secondary-300 transition hover:bg-secondary-300 hover:text-surface-100"
                onClick={() => recordJourneyEvent('contact_click', 'hero')}
              >
                {translations.general.buttons.emailMe}
                <ArrowIcon />
              </a>
              <a
                href={translations.general.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="mono-copy inline-flex items-center justify-center gap-3 border border-border px-6 py-4 text-sm text-text-secondary transition hover:border-primary-400 hover:text-primary-500"
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
              className="mono-copy mt-8 flex min-h-6 w-full max-w-[39ch] items-center justify-start gap-2 text-left text-sm text-text-secondary transition hover:text-secondary-300"
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
            <a href={translations.general.socials.github} target="_blank" rel="noopener noreferrer" className="mono-copy hidden items-center gap-2 text-sm text-text-secondary hover:text-secondary-300 sm:flex" onClick={() => recordJourneyEvent('external_profile_click', 'github-projects')}>
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
                <article key={`${experience.company}-${experience.startDate}`} className="grid gap-4 border-b border-border pb-6 last:border-b-0 md:grid-cols-[8rem_1fr]">
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
                className="mono-copy inline-flex items-center justify-center gap-3 border border-secondary-300 px-8 py-5 text-secondary-300 transition hover:bg-secondary-300 hover:text-surface-100"
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
                  className="mono-copy inline-flex min-h-[3.625rem] items-center justify-center border border-border px-8 py-5 text-text-secondary transition hover:border-secondary-300 hover:text-secondary-300 focus-visible:border-secondary-300 focus-visible:text-secondary-300"
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

          <div className="md:justify-self-end">
            <SectionLabel>{copy.fr ? 'Réseaux' : 'Links'}</SectionLabel>
            <div className="mt-4 flex flex-wrap gap-3">
              <a className="mono-copy border border-border px-4 py-3 text-sm text-text-secondary hover:border-secondary-300 hover:text-secondary-300" href={translations.general.socials.github} target="_blank" rel="noopener noreferrer" onClick={() => recordJourneyEvent('external_profile_click', 'github-footer')}>GitHub</a>
              <a className="mono-copy border border-border px-4 py-3 text-sm text-text-secondary hover:border-secondary-300 hover:text-secondary-300" href={translations.general.socials.linkedin} target="_blank" rel="noopener noreferrer" onClick={() => recordJourneyEvent('external_profile_click', 'linkedin-footer')}>LinkedIn</a>
              <a className="mono-copy border border-border px-4 py-3 text-sm text-text-secondary hover:border-secondary-300 hover:text-secondary-300" href={`mailto:${translations.general.socials.email}`} onClick={() => recordJourneyEvent('contact_click', 'footer')}>Email</a>
            </div>
          </div>
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
