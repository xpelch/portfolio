import Image from 'next/image';
import { recordJourneyEvent } from '@/lib/journey-events';
import type { Socials } from '@/types';
import { SectionLabel } from './HomePrimitives';
import { footerLinkClassName } from './homeClassNames';

export function FooterLinks({ isFrench, socials }: { isFrench: boolean; socials: Socials }) {
  return (
    <div className="md:justify-self-end">
      <SectionLabel>{isFrench ? 'Réseaux' : 'Links'}</SectionLabel>
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
          aria-label={isFrench ? 'Envoyer un courriel' : 'Send an email'}
          title={isFrench ? 'Courriel' : 'Email'}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3.5" y="5.5" width="17" height="13" stroke="currentColor" strokeWidth="1.5" />
            <path d="m4.5 7 7.5 6 7.5-6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </div>
  );
}
