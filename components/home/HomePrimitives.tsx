import type { ReactNode } from 'react';
import type { Translations } from '@/types';

export function ArrowIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h13M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ExternalIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 8h8v8M16 8 7 17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LocationIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 12.3a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6Z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function CrossIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M16 4v24M4 16h24M8 8l16 16M24 8 8 24" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function MailIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" stroke="currentColor" strokeWidth="1.5" />
      <path d="m4.5 7 7.5 6 7.5-6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mono-copy text-xs tracking-[0.18em] text-text-secondary">
      {'//'} {children}
    </p>
  );
}

export function StackTable({ translations }: { translations: Translations }) {
  const lanes = [
    ['Backend', translations.skills.backend],
    ['Frontend', translations.skills.frontend],
    ['Mobile', translations.skills.mobile ?? []],
    ['Quality', translations.skills.quality ?? []],
    ['DevOps', translations.skills.devops],
    ['Agentic', translations.skills.agentic ?? []],
    ['Web3', translations.skills.web3 ?? []],
  ] as const;

  return (
    <div className="border-y border-border">
      {lanes.map(([title, items]) => (
        <div
          key={title}
          className="grid gap-4 border-b border-border py-4 last:border-b-0 md:grid-cols-[9rem_1fr]"
        >
          <h3 className="mono-copy text-sm text-text-secondary">{title}</h3>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {items.map((item) => (
              <span key={item} className="text-sm text-on-background">
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
