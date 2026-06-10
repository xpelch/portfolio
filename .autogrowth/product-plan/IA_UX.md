# IA / UX Architecture

Product idea: Portfolio moderne, representatif et professionnel, cozy, avec quelques easter eggs et effets wow discrets. Objectif: polish produit comparable au GAFAM, zero friction, navigation evidente, workflows fluides, etats UI complets, performance percue rapide, accessibilite propre, qualite technique verifiee, en conservant le design actuel.
Workspace: portfolio
Context: fullstack
Target: BUILD A BILINGUAL DEVELOPER PORTFOLIO THAT MAKES XAVIER PELCHAT FEEL LIKE A

## Information Architecture
- Public: landing/current value, core task, proof/trust, account or checkout if needed, support/recovery.
- Admin: dashboard, content/config, users/customers, transactions/bookings/tasks, analytics, settings.
- System: auth/session, permissions, data states, integrations, notifications, logs, audit events.

## User Flows
- First visit -> understand offer -> start core task -> complete first success -> confirm next step.
- Returning user -> resume context -> act quickly -> receive confirmation or recovery path.
- Admin edit -> preview impact -> validate -> publish -> audit -> rollback if needed.

## Permissions
- Public/anonymous: read and start allowed public flows.
- Authenticated user: manage own profile, requests, purchases, bookings, or saved work.
- Admin: manage public content, operational records, support state, and configuration.
- Owner: billing, dangerous settings, integrations, exports, and permission changes.

## Product States
- Loading, empty, partial, offline, permission denied, validation failed, conflict, success, cancelled.
- Every state needs a title, explanation, primary action, secondary recovery, and telemetry event.

## Edge Cases
- Duplicate submits, expired sessions, unavailable integrations, stale admin preview, partial payments.
- Mobile keyboard/layout pressure, timezone/localization, rate limits, missing media, slow networks.
