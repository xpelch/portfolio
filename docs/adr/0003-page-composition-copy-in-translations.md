# The page is a composition of sections; all user-facing copy lives in translations

The portfolio page is a composition of six section components under
`components/sections/`, each reading directly from the typed `Translations`
object, and every user-facing string lives in the bilingual data files under
`public/translations/` (page-level strings in the `home` block). Inline
bilingual strings in components are forbidden, and parity is enforced
mechanically by a recursive key-parity test in `npm test`. Chosen because the
previous single 563-line page mixed markup, state, and hardcoded English and
French copy, silently bypassing the parity invariant (ADR-0002) and making the
code hard to navigate. A future engineer should not reintroduce inline copy —
the key-parity test is the guard that keeps the two locales honest.
