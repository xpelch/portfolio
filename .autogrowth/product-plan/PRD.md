# Discovery / PRD

Product idea: Portfolio moderne, representatif et professionnel, cozy, avec quelques easter eggs et effets wow discrets. Objectif: polish produit comparable au GAFAM, zero friction, navigation evidente, workflows fluides, etats UI complets, performance percue rapide, accessibilite propre, qualite technique verifiee, en conservant le design actuel.
Workspace: portfolio
Context: fullstack
Target: BUILD A BILINGUAL DEVELOPER PORTFOLIO THAT MAKES XAVIER PELCHAT FEEL LIKE A

## Users
- Primary user: the person who must get value from the product with minimal setup.
- Operator/admin: the person who configures, monitors, and supports the product.
- Secondary stakeholder: buyer, reviewer, teammate, or client affected by trust, speed, and clarity.

## Problem
- The product must turn the stated idea into a clear, reliable workflow instead of a loose feature list.
- Current unknowns must be made explicit before implementation choices become expensive.

## Jobs To Be Done
- When I arrive, I understand the value, state, and next action without instruction.
- When I need to complete the core task, I can finish it with zero avoidable friction.
- When something fails or is empty, I get a recoverable state, not a dead end.
- When I operate the product, I can update, audit, and support it without engineering help for routine work.

## Scope
- Public surface: core user journey, clear information hierarchy, trust cues, empty/loading/error states.
- Admin surface: content/configuration controls, permissions, audit trail, preview, and safe publish flow.
- System surface: auth, data model, API contracts, validation, telemetry, monitoring, and release gates.

## Non-Goals
- Copying the visual identity of Apple, Microsoft, Google, Meta, or TikTok.
- Shipping broad feature volume without proof that the core journey is fast, clear, and reliable.
- Replacing product judgment with a vanity score.

## Risks
- Ambiguous primary user or success metric.
- Admin controls that can break the public experience.
- No production telemetry, making product loops blind after launch.
- Over-polishing visuals before the first-success journey is proven.

## Metrics
- Activation: percent of users reaching first meaningful success.
- Friction: time to first success, drop-off step, rage clicks, repeat errors.
- Trust: completion confidence, support contact rate, failed publish rate.
- Reliability: latency p95, error rate, uptime, failed job rate.
- Operator efficiency: time to update content/config and publish safely.
