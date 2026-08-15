# Xavier Pelchat Portfolio

Bilingual Next.js portfolio for Xavier Pelchat. The site presents selected work,
production engineering proof, practical AI workflow signal, and contact paths.

## Commands

```powershell
npm install
npm run dev
npm run lint
npm run build
npm test
```

`npm test` is the canonical proof command. It runs:

- `tests/portfolio-content.test.mjs`
- `npm run lint`
- `npm run build`

## Visitor Journey

The primary journey is:

1. Land on the page and understand Xavier's role and offer.
2. Inspect selected work and proof points.
3. Switch between English and French.
4. Use contact, GitHub, or LinkedIn links.

Current visual proof is recorded in
`logs/visual/portfolio-journey-proof.md`.

## Codebase

Architecture and structure: `docs/architecture.md`. The page composes six
section components under `components/sections/`, and all user-facing copy
lives in `public/translations/` (en/fr parity is test-enforced).
