# Autogrowth

`VISION.md` is the destination. This file is the improvement strategy.
`EVALUATION.md` is the generated diagnostic.

## Product Target

- Destination source: `VISION.md`
- User/operator: engineering managers, founders, technical recruiters, and collaborators.
- Problem: the portfolio must prove Xavier's production engineering judgment quickly, without generic AI or portfolio tropes.
- Livrable: bilingual one-page Next.js portfolio with selected work, proof-backed copy, practical agentic signal, and clear contact paths.
- Primary runtime: Next.js 16 / React 19 / Tailwind CSS 4.
- Canonical verify command: `npm test`.
- First complete journey: land -> understand offer -> inspect selected work -> switch language -> contact/open project.

## AUTOGROWTH BENCHMARKS

- Reference visual bar: `references/ui-ref.png` and `references/ui-ref2.png` for dark, tactile, human portfolio direction.
- Awwwards/Creative Bloq portfolio bar: selected work stays visible and inspectable; visual craft supports the work instead of hiding it.
- Linear/Vercel proof bar translated to portfolio: status, proof, constraints, and next action should be obvious without reading internal docs.

## Current Focus

- Detected type: frontend portfolio.
- Target final: bilingual production-grade developer portfolio with verified visitor journey.
- One move that matters: keep the integrated visitor journey proof current after every UI/content change.
- Active blocker: remote production/analytics evidence is not connected.
- Proof artifact: `logs/visual/portfolio-journey-proof.md`.

## Feature Bets Log

| Date | Bet | Decision | Proof | Learning |
| --- | --- | --- | --- | --- |
| 2026-06-09 | Full redesign toward dark tactile developer portfolio with subtle agentic working signal | DO NOW | `npm test`; `logs/visual/portfolio-journey-proof.md` | The right direction is human, proof-backed, and tactile. A dashboard-like agentic concept reads wrong for this portfolio. |
| 2026-06-10 | Targeted first-viewport design polish: typography, palette, direct contact CTA, mobile language switcher placement | DO NOW | `npm test`; `logs/visual/portfolio-design-desktop-viewport.png`; `logs/visual/portfolio-design-mobile-fr.png` | Highest-leverage design work is still the visitor decision surface: identity, work, contact, proof, and bilingual control must be visible without overlap. |

## Blocker Log

| Date | Blocker | Escape lane | Stop condition | Result |
| --- | --- | --- | --- | --- |
| 2026-06-09 | No CI/test signal | Add `npm test` and GitHub Actions CI | `npm test` passes locally | Passed; CI workflow added, local proof available. |
| 2026-06-09 | Missing integrated visual proof | Capture desktop/mobile/French screenshots and link them in one proof artifact | No overflow, no missing images, no broken anchors | Passed locally; artifact written. |

## Proof Journal

| Date | Command / artifact | Result | Score impact |
| --- | --- | --- | --- |
| 2026-06-09 | `npm test` | Pass: content journey test, lint, production build | Raised Autogrowth baseline from 65 to 88 before journey artifact alignment. |
| 2026-06-09 | `logs/visual/portfolio-journey-proof.md` | Pass: desktop/mobile/French screenshots and link/image checks recorded | Intended to lift the 90 gate for integrated visitor journey proof. |
| 2026-06-10 | `npm test`; production-local Chrome screenshots on `127.0.0.1:3001` | Pass: content contract, lint, production build, desktop/mobile no horizontal overflow, French mobile CTA no longer hidden by language switcher | Improves local visitor-journey proof; score cap still waits on deployed production or analytics evidence. |
| 2026-06-10 | `npm test`; `logs/visual/portfolio-runtime-proof.md` | Pass: content contract, lint, production build, production-local `next start`, served translations, accent integrity, image loading, source anchors, and link contracts | Moves the proof lane from static/local notes toward repeatable production-equivalent verification; score cap still waits on browser screenshots and privacy-safe CTA event evidence. |
| 2026-06-10 | `npm test`; `logs/visual/portfolio-runtime-*.png` | Pass: production-local Chrome captures desktop EN, mobile EN, and mobile FR; no horizontal overflow; language switcher no longer overlaps visible CTAs | Lifts the screenshot gap in the production-equivalent proof lane; next cap is CTA event evidence or a live deployed URL tied to the same evaluated state. |
| 2026-06-10 | `npm run proof:production`; `logs/visual/portfolio-production-proof.md` | Pass: production EN/FR desktop/mobile screenshots, runtime anchors, accent integrity, images, GitHub/project live links; LinkedIn reports provider-blocked 999 | Clears the repeatable live-link proof gap for public GitHub/project paths; remaining external blocker is LinkedIn bot protection, plus CTA telemetry and CI status. |
| 2026-06-10 | `npm test`; `npx vercel --prod --yes`; `npm run proof:production` | Pass: deployed URL records privacy-safe journey events for project open, contact click, outbound profile click, and language switch; production screenshots and live links still pass | Converts the CTA telemetry blocker into a repeatable smoke proof; remaining score cap is real field evidence, not local/proof-session events. |
| 2026-06-10 | `npm test`; Autogrowth loop with `--sandbox-mode copy` | Pass: runtime proof now resolves the Next CLI through Node module resolution instead of assuming sandbox-local `node_modules` | Removes a false proof failure in copied sandboxes and makes Autogrowth cycles safer to repeat. |
| 2026-06-10 | `.github/workflows/ci.yml`; `npm test`; `npm run proof:production`; workflow YAML smoke | Pass: CI workflow now runs the local journey proof, production journey proof, and uploads runtime/production proof artifacts from `logs/visual` | Prepares the remote CI artifact needed for the 88/90 cap; the artifact becomes field evidence after the workflow runs on GitHub. |
| 2026-06-10 | `npm test`; `npx vercel --prod --yes`; `npm run proof:production`; Autogrowth loop sandbox copy | Pass: first viewport decision surface is verified on desktop EN, mobile EN, and mobile FR; production journey events are acknowledged and exported as a privacy-safe analytics signal | Lifts the Autogrowth score to 90 by connecting mobile hero proof, deployed runtime proof, and normalized telemetry. |

## LOOP LEARNING

- 2026-06-10T20:26:49Z : loop iter 1 proof=failed score_delta=0 judge=reject
- 2026-06-11T02:05:22Z : loop iter 1 proof=passed score_delta=0 judge=accept
- 2026-06-11T02:06:49Z : loop iter 1 proof=failed score_delta=0 judge=reject
- 2026-06-11T02:12:21Z : loop iter 1 proof=failed score_delta=0 judge=reject
- 2026-06-11T02:13:10Z : loop iter 1 proof=passed score_delta=0 judge=accept
- 2026-06-11T02:24:48Z : loop iter 1 proof=passed score_delta=0 judge=accept
- 2026-06-11T02:39:04Z : loop iter 1 proof=passed score_delta=0 judge=accept
- 2026-06-11T02:41:38Z : loop iter 1 proof=passed score_delta=0 judge=accept
