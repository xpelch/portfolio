# Architecture

## Runtime

- Framework: Next.js 16 App Router.
- UI: React 19 client-rendered portfolio page.
- Styling: Tailwind CSS 4 tokens in `app/globals.css`.
- Content: static bilingual JSON under `public/translations/`.
- Asset: generated black-and-white workspace image under `public/images/`.

## Boundaries

- `app/layout.tsx`: metadata, language provider, hydration boundary, language switcher.
- `app/page.tsx`: redesigned one-page visitor journey composition.
- `contexts/LanguageContext.tsx`: locale state, translation loading, fallback to English.
- `types/index.ts`: shared content contracts for translations, projects, skills, and proof fields.
- `tests/portfolio-content.test.mjs`: executable content and journey contract.
- `.github/workflows/ci.yml`: CI proof path.

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

- GitHub Actions workflow has been added locally, but remote CI execution is not observed in this workspace.
- There is no production analytics or field-signal connector yet.
- The professional case study intentionally avoids confidential employer/client details.
