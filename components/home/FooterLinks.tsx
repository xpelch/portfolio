import Image from 'next/image';
import { recordJourneyEvent } from '@/lib/journey-events';
import type { Translations } from '@/types';
import { MailIcon, SectionLabel } from './HomePrimitives';
import { footerLinkClassName } from './homeClassNames';

export function FooterLinks({ translations }: { translations: Translations }) {
  const { home, general } = translations;
  const socials = general.socials;

  return (
    <div className="md:justify-self-end">
      <SectionLabel>{home.footerLinksLabel}</SectionLabel>
      <div className="mt-4 flex flex-wrap gap-3">
        <a
          className={footerLinkClassName}
          href={socials.github}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => recordJourneyEvent('external_profile_click', 'github-footer')}
          aria-label="GitHub"
          title="GitHub"
        >
          <Image src="/logos/github-mark-white.png" alt="" width={20} height={20} className="opacity-75 transition group-hover:opacity-100" />
        </a>
        <a
          className={footerLinkClassName}
          href={socials.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => recordJourneyEvent('external_profile_click', 'linkedin-footer')}
          aria-label="LinkedIn"
          title="LinkedIn"
        >
          <Image src="/logos/linkedin-mark-white.png" alt="" width={20} height={20} className="opacity-75 transition group-hover:opacity-100" />
        </a>
        <a
          className={footerLinkClassName}
          href={`mailto:${socials.email}`}
          onClick={() => recordJourneyEvent('contact_click', 'footer')}
          aria-label={home.footerEmailLabel}
          title={home.footerEmailTitle}
        >
          <MailIcon />
        </a>
      </div>
    </div>
  );
}
