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
        >
          GitHub
        </a>
        <a
          className={footerLinkClassName}
          href={socials.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => recordJourneyEvent('external_profile_click', 'linkedin-footer')}
        >
          LinkedIn
        </a>
        <a
          className={footerLinkClassName}
          href={`mailto:${socials.email}`}
          onClick={() => recordJourneyEvent('contact_click', 'footer')}
        >
          Email
        </a>
      </div>
    </div>
  );
}
