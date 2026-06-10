# Production Readiness

Product idea: Portfolio moderne, representatif et professionnel, cozy, avec quelques easter eggs et effets wow discrets. Objectif: polish produit comparable au GAFAM, zero friction, navigation evidente, workflows fluides, etats UI complets, performance percue rapide, accessibilite propre, qualite technique verifiee, en conservant le design actuel.
Workspace: portfolio
Context: fullstack
Target: BUILD A BILINGUAL DEVELOPER PORTFOLIO THAT MAKES XAVIER PELCHAT FEEL LIKE A

## Required Systems
- Auth: roles, sessions, passwordless/social options if useful, recovery, permission tests.
- Billing: plans, invoices, refunds, webhooks, idempotency, entitlement checks when monetized.
- Analytics: activation, conversion, retention, drop-off, admin publish, support events.
- Monitoring: uptime, latency, error rate, job failures, integration failures, alert routing.
- Error reporting: client/server stack traces, release tags, user impact, redaction.
- Backup: database backups, media backup, restore drill, retention policy.
- Privacy: data map, consent, deletion/export, least privilege, secret handling.
- Rate limits: public endpoints, auth endpoints, admin mutations, third-party integrations.
- Admin controls: audit log, preview, validation, publish, rollback, support impersonation policy.
- Support ops: ticket taxonomy, runbooks, escalation, known issue status, customer-safe logs.

## Launch Gate
- No critical journey ships without tests, telemetry, rollback, and a human-readable support path.
