---
name: frontend-design
description: "This skill should be used when a task requires designing or implementing frontend UI (components, pages, layouts, styling) and no more specialized frontend skill is a better fit. It guides production-grade, brand-consistent visual implementation with distinctive but controlled aesthetics."
compatibility: opencode
metadata:
  topics:
    - typography
    - color-systems
    - motion-design
    - spatial-composition
---

Create distinctive, production-grade frontend interfaces while preserving brand consistency and implementation quality.

Use this skill when the request is to build or style a frontend component, page, or interface and the task is primarily visual/UX implementation.

## Project Design Foundation

Read project design sources before making visual decisions.

- **`docs/design.md`** — Source of truth for tokens, typography, spacing, radii, shadows, dark mode, and component patterns.
- **`docs/sales.md`** — Source of truth for audience, positioning, and messaging tone.

Apply these constraints:

- Primary color: Trust Bold Blue `#2563eb` (more saturated than Confluence)
- Font: Inter as the default UI/body typeface (intentional brand choice)
- Tone: Professional confidence — modern but not intimidating for corporate BAs
- Radius: 8px default, consistent with Linear/Notion SaaS aesthetic
- Must work in both light and dark modes

## Design Thinking

Define context before coding, then choose one clear visual direction:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick one dominant style direction, then keep all components aligned with it.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

Keep experimentation bounded by brand rules:

- Keep Inter for body/UI text and forms.
- Use accent/display typography only for headings, callouts, or hero moments.
- Limit accent/display font families to one per surface unless the project already defines a different pattern.
- Keep component primitives (spacing rhythm, corner radius, density, interaction patterns) consistent with existing product patterns.
- Select one primary mood per interface and one supporting motif; avoid mixing multiple unrelated aesthetics.

Implement working code using the project’s existing stack by default:

- Reuse the current framework, styling system, and component primitives already used in the repository.
- Avoid introducing a new framework or styling paradigm unless the task explicitly requires it.

Ensure the result is:

- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Apply these design rules:

- **Typography**: Keep Inter as default body/UI typography. Introduce a distinctive accent/display font only when it reinforces the selected mood. Preserve readability and hierarchy.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use purposeful motion to clarify hierarchy and affordance. Prioritize CSS-first motion where practical. Use framework-native motion libraries only when already present or explicitly requested. Concentrate motion in key transitions instead of saturating every element.
- **Spatial Composition**: Introduce variation deliberately (asymmetry, overlap, density shifts) while preserving scanability and interaction clarity.
- **Backgrounds & Visual Details**: Add depth only when it supports the chosen mood and does not reduce legibility, contrast, or performance.

Avoid repetitive default aesthetics and context-free visual clichés. Prefer decisions tied to brand, audience, and product intent.

Vary aesthetics across tasks within controlled bounds: vary accent/display treatment, composition motif, and motion character; keep brand primitives stable.

Match implementation complexity to the selected direction. Increase effect complexity only when it materially improves communication or brand expression. Use restraint for minimal or refined directions.

Execute creative choices with discipline: prioritize coherence, usability, accessibility, and maintainability over novelty for its own sake.
