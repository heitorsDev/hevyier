# Product

## Register

product

## Users

Single user (the developer). Gym-goer who trains with a structured plan. Uses the app mid-workout, under physical exertion, holding a phone in one hand between sets. Context demands speed and large touch targets — not readability at a desk.

## Product Purpose

Track gym workouts with minimal friction. Solves three problems with Hevy: set registration requires too many taps and too much keyboard interaction; analytics are paywalled; no ownership or extensibility. Core invariant: logging a set must be possible without opening a keyboard.

## Brand Personality

Shares its design language with magic-alliance: the shadcn token schema
(style `base-mira`, neutral base, 0.45rem radius) in its dark palette —
near-black background, raised card surfaces, blue primary, muted-
foreground secondary text. One vocabulary across both projects means a
component can move between them by copy-paste.

The gym constraints still bind inside that vocabulary: large touch
targets, monospace numerals so set columns align, and enough contrast to
read under bright gym lighting.

## Anti-references

- **Hevy**: paywalled analytics and a set-logging flow that demands the
  keyboard. The look is not the objection; the friction is.
- **MyFitnessPal**: bloated dashboard, sidebar clutter, gamification
  badges. Avoid information overload and feature noise.
- **Generic fitness apps**: trophy icons, "Let's crush it today!" UX copy,
  motivational microcopy. Avoid entirely.

## Design Principles

1. **The set logs itself.** Every interaction on the logging screen must
   be achievable without a keyboard. Tapping beats typing.
2. **Data is chrome-free.** Information sits at the surface; navigation
   and decoration recede. The UI is the data.
3. **Tokens, never literals.** Colour, radius and spacing come from the
   shared token schema in `global.css`. A hardcoded hex is a bug.
4. **Speed over ceremony.** No loading states for local data, no
   confirmation dialogs for reversible actions, no animated transitions
   that gate access to content.
5. **Personal tool, not a product.** No onboarding flows, no empty-state
   motivational copy, no social hooks. Assume the user knows what they
   are doing.

## Accessibility & Inclusion

Personal use only. No formal WCAG target. Touch targets should meet iOS HIG minimum (44pt) because the user is mid-workout. Contrast should be legible in bright gym lighting (high contrast is free on a monochrome palette).
