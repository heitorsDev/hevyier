# Product

## Register

product

## Users

Single user (the developer). Gym-goer who trains with a structured plan. Uses the app mid-workout, under physical exertion, holding a phone in one hand between sets. Context demands speed and large touch targets — not readability at a desk.

## Product Purpose

Track gym workouts with minimal friction. Solves three problems with Hevy: set registration requires too many taps and too much keyboard interaction; analytics are paywalled; no ownership or extensibility. Core invariant: logging a set must be possible without opening a keyboard.

## Brand Personality

Sharp, modern, monochromatic. The app is a precision tool — it should feel like a stopwatch or a barbell, not a lifestyle product. Black and white. No softness, no rounding, no warmth-by-default.

## Anti-references

- **Hevy**: polished consumer feel, soft rounded cards, pastel accents, lifestyle-adjacent aesthetic. Avoid all of it.
- **MyFitnessPal**: bloated dashboard, sidebar clutter, gamification badges. Avoid information overload and feature noise.
- **Generic fitness apps**: purple/gradient hero cards, trophy icons, "Let's crush it today!" UX copy, motivational microcopy. Avoid entirely.
- **Health/wellness apps**: sage green, cream/sand backgrounds, breathing-room pacing, rounded-everything. This is a gym tool, not a meditation app.

## Design Principles

1. **The set logs itself.** Every interaction on the logging screen must be achievable without a keyboard. Tapping beats typing.
2. **Data is chrome-free.** Information sits at the surface; navigation, decoration, and affordance indicators recede. The UI is the data.
3. **Monochrome earns its hierarchy.** Black and white is not a limitation — it forces weight, size, and spacing to do all the work. No color shortcuts.
4. **Speed over ceremony.** No loading states for local data, no confirmation dialogs for reversible actions, no animated transitions that gate access to content.
5. **Personal tool, not a product.** No onboarding flows, no empty-state motivational copy, no social hooks. Assume the user knows what they're doing.

## Accessibility & Inclusion

Personal use only. No formal WCAG target. Touch targets should meet iOS HIG minimum (44pt) because the user is mid-workout. Contrast should be legible in bright gym lighting (high contrast is free on a monochrome palette).
