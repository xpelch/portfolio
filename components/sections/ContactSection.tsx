'use client';

import type { Translations } from '@/types';
import { FooterLinks } from '@/components/home/FooterLinks';
import { ArrowIcon, SectionLabel } from '@/components/home/HomePrimitives';
import { contactPrimaryLinkClassName } from '@/components/home/homeClassNames';
import { recordJourneyEvent } from '@/lib/journey-events';

export function ContactSection({ translations }: { translations: Translations }) {
  const { home, cta } = translations;

  return (
    <section id="contact" data-section className="grid gap-10 border-t border-border py-14 md:grid-cols-[1fr_auto] md:items-end">
      <div className="space-y-6">
        <SectionLabel>{home.contactTitle}</SectionLabel>
        <p className="mt-4 max-w-md text-text-secondary">{home.contactBody}</p>
        <a
          href={`mailto:${cta.email}`}
          className={contactPrimaryLinkClassName}
          onClick={() => recordJourneyEvent('contact_click', 'contact-section')}
        >
          {cta.buttonText}
          <ArrowIcon />
        </a>
      </div>

      <FooterLinks translations={translations} />
    </section>
  );
}
