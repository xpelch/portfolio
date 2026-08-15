# Bilingual content parity is an enforced invariant

The site is published in two Languages, English and French, and every
site-authored content string must exist in both. Parity is enforced, not
aspirational: the content is dual-structure by type (`Translations`), the
switch is a first-class Journey Event, and the canonical proof command
(`npm test`) checks the translation contracts — a missing string in either
locale fails the build. Chosen over incremental localization because the
visitor's language choice is itself part of the product signal, and drift
between locales would quietly degrade the portfolio's credibility. Content
linked externally (GitHub READMEs, LinkedIn, external Project pages) is
explicitly out of scope.
