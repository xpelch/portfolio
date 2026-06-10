# Continuous Product Telemetry

Product idea: Portfolio moderne, representatif et professionnel, cozy, avec quelques easter eggs et effets wow discrets. Objectif: polish produit comparable au GAFAM, zero friction, navigation evidente, workflows fluides, etats UI complets, performance percue rapide, accessibilite propre, qualite technique verifiee, en conservant le design actuel.
Workspace: portfolio
Context: fullstack
Target: BUILD A BILINGUAL DEVELOPER PORTFOLIO THAT MAKES XAVIER PELCHAT FEEL LIKE A

## Signals
- Usage: activation, repeat usage, feature adoption, admin publish frequency.
- Drop-offs: step exits, form abandonment, checkout/booking/request failures.
- Rage clicks: repeated clicks, dead controls, validation loops, navigation reversals.
- Errors: client/server exceptions, integration failures, failed jobs, validation clusters.
- Latency: p50/p95 for page load, API, search/filter, publish, upload, transaction.
- Conversion: visit to start, start to first success, first success to repeat or paid plan.
- Tickets: support reasons, severity, affected flow, time to resolution.
- Recordings: sampled sessions for failed core journey and admin publish flow.

## Loop
- Weekly: read context pack, score contracts, telemetry summary, top drop-off, top error, top support issue.
- Pick one cap to attack, create one bounded prompt, run proof, update state, stop on failed proof.
- Monthly: benchmark against the reference bar and recalibrate the roadmap.

## Event Contract
- event_name, user_role, workspace_id, journey_id, step, status, latency_ms, error_code, release, metadata.
- Do not store secrets, raw payment data, or unnecessary personal data in telemetry.
