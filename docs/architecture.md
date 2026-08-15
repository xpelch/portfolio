# Architecture

## Runtime

- Framework: Next.js 16 App Router.
- UI: React 19 client-rendered portfolio page.
- Styling: Tailwind CSS 4 tokens in `app/globals.css`.
- Content: static bilingual JSON under `public/translations/`.
- Asset: generated black-and-white workspace image under `public/images/`.

## Codebase map

```
app/
  layout.tsx            metadata, language provider, hydration boundary, language switcher
  page.tsx              page chrome (header, recovery banner, command deck) composing the sections
  api/journey/route.ts  validate-and-ack journey event sink (stores nothing)
components/
  sections/             the six page sections, each reading typed translations
    HeroSection, ProjectsSection, ExperienceSection, AboutSection, StackSection, ContactSection
  home/                 page-specific shared pieces
    CommandDeck, FooterLinks, HomePrimitives (icons + primitives), ProjectCard, homeClassNames
  ui/                   LoadingSpinner, HydrationBoundary
contexts/
  LanguageContext.tsx   locale state, translation loading, fallback to English
lib/
  journey-events.ts     privacy-safe journey event recording
types/
  index.ts              shared content contracts (Translations, Project, Experience, ...)
public/translations/    en.json + fr.json, the single source of truth for all user-facing copy
tests/                  content contract, asset, script, and runtime journey proofs
```

## Boundaries

- `app/page.tsx` owns page-level state (command deck open/close, focus restore,
  language recovery notice) and composes the six sections. It contains no
  section markup and no user-facing copy.
- `components/sections/*` render one page section each, reading directly from
  the typed `Translations` object passed as a prop.
- All user-facing copy lives in `public/translations/` under the `home` block
  for page-level strings. Inline bilingual strings are forbidden (ADR-0003);
  parity is enforced by a recursive key-parity test.
- `components/home/*` are the page's shared pieces; `components/ui/*` are
  generic primitives.
- `lib/journey-events.ts` records the four Journey Events
  (`contact_click`, `project_open`, `external_profile_click`,
  `language_switch`) as fire-and-forget, non-persistent telemetry (ADR-0001).

## Critical Journey

The visitor journey is:

1. First viewport: name, role, location, offer, CTAs, proof strip, quiet agentic working signal.
2. Selected work: project description, outcome, proof, constraint, stack, and link.
3. Experience/profile/stack: production experience and skills.
4. Language switch: English and French content parity.
5. Contact: mailto, GitHub, LinkedIn.

## Verification

Canonical command:

```powershell
npm test
```

Visual proof:

```text
logs/visual/portfolio-journey-proof.md
logs/visual/portfolio-desktop-viewport.png
logs/visual/portfolio-mobile-full.png
logs/visual/portfolio-mobile-fr.png
```

## Risks

- There is no production analytics or field-signal connector yet; journey
  telemetry is validate-and-ack only (ADR-0001).
- The professional case study intentionally avoids confidential employer/client details.
