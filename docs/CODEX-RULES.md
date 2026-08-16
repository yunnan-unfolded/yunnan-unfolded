# Yunnan Unfolded — Codex / AI Development Rules

Read these files BEFORE modifying product/design behavior:
1. docs/BRAND.md
2. docs/DESIGN-SYSTEM.md
3. docs/DECISIONS.md
4. this file

## Roles
- Chloe: product owner and final visual/brand approver.
- ChatGPT: product/design/technical lead and QA coordinator.
- Codex: implementation engineer for scoped development tasks.

## Implementation discipline
1. Do not redesign unrelated approved sections while completing a task.
2. LOCKED decisions in DECISIONS.md override aesthetic improvisation.
3. Prefer one focused theme per implementation task.
4. Do not reinterpret supplied brand assets. Use the actual approved SVG/image asset when available.
5. Do not replace authentic-Yunnan requirements with generic mountain imagery as a final solution.
6. Keep content/data easy to replace rather than hardcoding presentation logic.
7. Do not start a later phase until the current visual/functional milestone is approved.

## Definition of done
For each implementation task:
- implement the requested scope only
- verify no regression to LOCKED areas
- run TypeScript checks
- run ESLint
- run production build
- check relevant responsive widths
- report files changed and any placeholders/known limitations

## Review workflow
DISCUSS → SPEC → BUILD → QA → VISUAL REVIEW → LOCK

A task is not considered visually approved merely because it builds successfully. Chloe's visual approval is required before a design section becomes LOCKED.

## Source of truth
GitHub repository state plus the files under /docs are the project source of truth. Do not rely on an old chat instruction when it conflicts with a newer LOCKED decision in DECISIONS.md.
