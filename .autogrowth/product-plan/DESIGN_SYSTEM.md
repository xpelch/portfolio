# Design System

Product idea: Portfolio moderne, representatif et professionnel, cozy, avec quelques easter eggs et effets wow discrets. Objectif: polish produit comparable au GAFAM, zero friction, navigation evidente, workflows fluides, etats UI complets, performance percue rapide, accessibilite propre, qualite technique verifiee, en conservant le design actuel.
Workspace: portfolio
Context: fullstack
Target: BUILD A BILINGUAL DEVELOPER PORTFOLIO THAT MAKES XAVIER PELCHAT FEEL LIKE A

## Tokens
- Color: semantic tokens for background, surface, text, muted text, border, accent, danger, success, warning.
- Type: display, title, body, caption, mono; no viewport-scaled font sizes.
- Spacing: 4px base grid with dense operational surfaces and relaxed public storytelling surfaces.
- Radius: default 6-8px for cards and controls unless existing system says otherwise.
- Motion: short, purposeful transitions only for feedback, hierarchy, and continuity.

## Components
- Buttons with icon affordances, loading/disabled states, and stable dimensions.
- Inputs, selects, date/time controls, upload/media controls, segmented controls, tabs, menus, tables.
- Cards only for repeated items, modals, or genuinely framed tools; no card-in-card layouts.
- Toasts, inline errors, empty states, skeletons, progress indicators, confirmation dialogs.

## Responsive / Accessibility
- Mobile first for core task, but desktop dense enough for admin scanning and repeated work.
- Visible focus, keyboard paths, labels, contrast, target sizes, reduced-motion support.
- Text must not overlap or overflow controls at common desktop and mobile widths.

## Polish Criteria
- The first viewport communicates product purpose and next action.
- Primary journey has no decorative friction or ambiguous choices.
- Admin flows expose preview, validation, publish safety, and rollback.
- Visual density matches the job: calm and operational for admin, expressive only where it helps public trust.
