# Interaction, Accessibility, And Responsive Behavior

Load when UI changes user interaction or layout.

Treat each interaction as state machine: initial/loading, ready, empty, blocked/unauthorized, error, submitting, success, and retry/cancel where operation supports it. Do not leave users guessing after a click. Keep feedback near action, preserve entered values after recoverable errors, and prevent duplicate destructive requests.

Keep submit available except while pending. On invalid submission, never silently no-op: expose concrete inline errors, reveal any containing collapsed panel, preserve entered values, and move focus to first invalid control. Keep server validation failure distinct from client field validation and retain the same recovery contract.

Use semantic native controls first. Every interactive control has accessible name, visible or programmatic label, keyboard operation, focus visibility, and disabled/busy semantics. Modals move focus predictably, trap it while open when local pattern does, close by expected keyboard action, and restore trigger focus. Do not encode meaning only by color, icon, hover, or position. Announce meaningful async status changes without noisy duplicate announcements.

Design narrow-to-wide. Content reflows without clipping, horizontal page scroll, hover-only access, or tiny targets. Test dense text, long labels, zoom, keyboard-only navigation, and reduced-motion preferences. Use existing design tokens and primitives; do not invent parallel spacing, color, or breakpoint systems.

Keep text separate from layout logic. Reserve space and copy for loading and error states; avoid layout jumps that move active controls. Confirm destructive actions according to local convention and make consequences clear.

## Completion

- [ ] Every changed action has loading, failure, and success/cancel behavior.
- [ ] Invalid submit exposes inline errors, reveals its panel, preserves values, and focuses first invalid control.
- [ ] Keyboard, focus, labels, semantics, and contrast are preserved.
- [ ] Narrow viewport, long text, and zoom remain usable.
- [ ] Async feedback is visible and non-duplicative.
