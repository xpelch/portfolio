# Execution Graph

Use this as the bridge from product plan to implementation loops.

## slice-public-first-success

Title: Public first-success journey
Source docs: PRD.md, IA_UX.md, DESIGN_SYSTEM.md, COMPETITIVE_BENCHMARK.md

Deliverables:
- public route/screen
- responsive UI states
- trust cues
- first-success confirmation

Proof gates:
- build/test passes
- desktop and mobile screenshot
- loading/empty/error states visible
- journey event emitted

Telemetry hooks:
- journey_started
- first_success_completed
- journey_abandoned
- ui_error_seen

## slice-admin-preview-publish

Title: Admin edit, preview, validate, publish
Source docs: PRD.md, IA_UX.md, IMPLEMENTATION_PLAN.md, PRODUCTION_READINESS.md

Deliverables:
- admin surface
- permission checks
- preview
- validation
- publish audit log
- rollback path

Proof gates:
- admin happy path test
- permission denial test
- publish rollback proof
- audit record proof

Telemetry hooks:
- admin_edit_started
- admin_preview_opened
- admin_publish_succeeded
- admin_publish_failed

## slice-data-api-contracts

Title: Data model and API contracts
Source docs: IMPLEMENTATION_PLAN.md, PRODUCTION_READINESS.md

Deliverables:
- schema/migrations
- API request/response contracts
- validation errors
- idempotency rules

Proof gates:
- migration test
- contract test
- validation failure test
- rate-limit or abuse test

Telemetry hooks:
- api_request_completed
- api_request_failed
- validation_failed
- rate_limit_hit

## slice-observability-support

Title: Observability, support, and recovery
Source docs: PRODUCTION_READINESS.md, TELEMETRY_LOOP.md

Deliverables:
- error reporting
- health/metrics
- support taxonomy
- backup/restore note
- operator runbook

Proof gates:
- health check proof
- error event proof
- support event proof
- backup/restore drill note

Telemetry hooks:
- error_reported
- support_ticket_created
- health_check_failed
- restore_drill_completed

## slice-telemetry-growth-loop

Title: Telemetry-driven product loop
Source docs: COMPETITIVE_BENCHMARK.md, TELEMETRY_LOOP.md

Deliverables:
- normalized telemetry summary
- top drop-off
- top error
- next experiment prompt
- benchmark delta

Proof gates:
- signals normalized
- priority cap selected
- experiment prompt bounded
- score contract run

Telemetry hooks:
- dropoff_detected
- rage_click_detected
- conversion_changed
- latency_regressed
