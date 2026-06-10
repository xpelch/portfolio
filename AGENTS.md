# Agent Starter Rules

Use this file as the procedural rulebook for agents operating from the Portfolio
workspace root at `C:\Programming\portfolio`.

## Grounding

- Platform identity stays Codex. Atlas is the local operating posture and
  workflow runtime for this repository.
- Start substantial work by reading `agent-context/IDENTITY.md` and the relevant
  files under `context/`.
- Prefer repo-local context, playbooks, templates, and tools before broad file
  scans or external references.
- Keep generated runtime state under `.atlas/`, `logs/`, and `output/`
  local-only unless the user explicitly asks to version it.
- Treat secrets, credentials, connection strings, keys, and environment files as
  non-readable by default.

## Atlas Workflow

- Use `C:\Programming\portfolio\atlas.ps1 ... -Mode jarvis` for the local Atlas
  loop: `status`, `sense`, `plan`, `verify`, `handoff`, and `remember`.
- Use `C:\Programming\portfolio\tools\atlas-refresh\atlas-refresh.ps1 -Config C:\Programming\portfolio\workflow.config.json`
  after changing workflow files.
- Use `tools\workflow-bootstrap`, `tools\workflow-backup`,
  `tools\workflow-restore`, `tools\workflow-install-org`, and
  `tools\workflow-export-start` for portable workflow maintenance.
- Use `tools\atlas-catalog`, `tools\atlas-audit`, `tools\atlas-changeset`,
  `tools\atlas-run`, `tools\atlas-contracts`, and
  `tools\atlas-promote-knowledge` when work spans multiple modules or requires
  durable evidence.

## Planning

- For non-trivial work, make a short plan before editing code.
- Identify the involved files, runtime boundary, validation path, and rollback
  option before broad changes.
- If the first approach fails or scope drifts, stop and re-plan instead of
  forcing the change through.

## Execution Defaults

- Prefer small, reversible edits.
- Prefer explicit scripts and repeatable artifacts over ad hoc prompting.
- Prefer structured files such as JSON, YAML, and Markdown checklists when a
  workflow needs to be replayed.
- Keep durable knowledge in `context/` and transient session output in `logs/`.
- Avoid changing unrelated code or generated output.

## Verification

- Do not mark work complete without proving it works.
- Run the narrowest useful test, check, build, or tool validation for the change.
- When workflow behavior changes, verify referenced files, paths, and commands
  exist and run.

## Failure Recovery

- If a playbook fails or scope drifts, follow `playbooks/recover-from-failure.md`.
- Never force the same failing approach twice without a new plan.
- Document durable lessons in `context/` only when they are stable and reusable.

<!-- AUTOGROWTH-AGENT-CONTEXT:START -->
## Autogrowth Agent Context

Before broad product work, read these files in order:

- `VISION.md`: product destination and quality bar.
- `AUTOGROWTH.md`: improvement strategy, blockers, proof journal, and loop learning.
- `EVALUATION.md`: latest generated score, caps, weakest evidence, and next bounded move.
- `.autogrowth/context-pack.json`: compact state packet for token-efficient follow-up agents.
- `.autogrowth/product-plan/product-plan.json`: machine-readable product plan index.
- `.autogrowth/product-plan/PRD.md`: users, problem, scope, non-goals, risks, metrics.
- `.autogrowth/product-plan/IA_UX.md`: information architecture, user flows, permissions, states, edge cases.
- `.autogrowth/product-plan/DESIGN_SYSTEM.md`: tokens, components, responsive/a11y rules, polish criteria.
- `.autogrowth/product-plan/IMPLEMENTATION_PLAN.md`: milestones, vertical slices, API/data/test/release gates.
- `.autogrowth/product-plan/COMPETITIVE_BENCHMARK.md`: Apple/Microsoft/Google/Meta/TikTok comparison criteria.
- `.autogrowth/product-plan/PRODUCTION_READINESS.md`: auth, billing, monitoring, privacy, backups, support ops.
- `.autogrowth/product-plan/TELEMETRY_LOOP.md`: usage, drop-offs, rage clicks, errors, latency, conversion, tickets.
- `.autogrowth/product-plan/execution-graph.json`: plan-to-slice map with proof gates and telemetry hooks.
- `.autogrowth/signals/normalized.json`: normalized field telemetry priorities when available.

Rules for agents:

- Do one vertical slice at a time.
- Preserve public UX quality and admin operator efficiency.
- Attach proof for every change: test, build, screenshot, benchmark, telemetry, or trace.
- Update Autogrowth artifacts only through the evaluator or a scoped manual edit.
- Do not store secrets in Autogrowth artifacts.

Current product-plan entry point: `.autogrowth/product-plan/`.
<!-- AUTOGROWTH-AGENT-CONTEXT:END -->
