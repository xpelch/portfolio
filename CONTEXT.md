# Portfolio

A bilingual developer portfolio that presents selected work, production
engineering proof, and practical AI workflow signal to evaluators, with a
privacy-safe telemetry loop for the visitor journey.

## Language

### Audience

**Visitor**:
A person evaluating the portfolio — engineering manager, founder, technical
recruiter, or collaborator — whose job is to understand Xavier's stack,
judgment, and work style in under two minutes.
_Avoid_: User, reader

**Journey**:
The path a Visitor takes from landing to contact: understand the offer,
inspect work, switch language, start contact.
_Avoid_: Funnel, flow

**Journey Event**:
One named telemetry action a Visitor performs on the site: `contact_click`,
`project_open`, `external_profile_click`, `language_switch`. Deliberately
minimal, non-identifying, and never blocking the UI.
_Avoid_: Analytics event, tracking event

**Contact**:
The terminal step of the Journey — reaching Xavier through one of two
channels: the email CTA (`contact_click`) or the external profiles GitHub and
LinkedIn (`external_profile_click`).
_Avoid_: CTA (as a domain term), Outreach

### Content

**Project**:
A selected piece of work presented as a card, either public (links out,
records a `project_open` event) or private (shown without a link, telemetry
silent).
_Avoid_: Work (informal copy only), Case study

**Proof**:
The per-Project evidence narrative shown on the Project card — the role,
constraint, outcome, and proof fields.
_Avoid_: Evidence, Claim

**Proof Point**:
A single `label + value` item in the portfolio-level proof strip on the
landing page, independent of any specific Project.
_Avoid_: Metric, Stat

**Operator Signal**:
Evidence that Xavier operates AI-assisted workflows in production — a
portfolio-level `{title, description, steps}` block, deliberately subordinate
to the Projects.
_Avoid_: AI signal, Agentic showcase

**Language**:
One of the two locales the site is published in, English and French, with the
invariant that all site-authored content exists in both (parity). Switching is
a first-class Journey Event.
_Avoid_: Locale (as a code term), Translation
