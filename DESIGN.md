# Washer Machine — UI design rules (TasteSkill)

## Non‑negotiables
- **One accent color**: use only `--accent` / `--accent-bg` / `--accent-border`.
- **No neon / outer glows**: no `shadow-[0_0_*]`, no glowing gradients.
- **No emoji** in UI copy, alt text, or labels.
- **No Inter**: typography comes from `next/font` in `src/app/layout.tsx`.

## Layout
- **Hero**: asymmetric, left content + right visual. Avoid centered hero patterns.
- **No 3 equal feature cards**: prefer asymmetric grids or 2-col patterns.
- **Max width**: keep page content in `max-w-6xl`/`max-w-7xl` containers.
- **No `h-screen`** for full-height sections; use `min-h-[100dvh]` when needed.

## Components
- **Buttons**: tactile `active:translate-y-px active:scale-[0.98]`, visible focus ring via `--focus-ring`.
- **Forms**: label above input, errors below input, consistent spacing.
- **Motion**: transform/opacity only; honor `prefers-reduced-motion`.

## Visuals
- Prefer **lineart** and **isometric** illustrations over photos/stock assets.
- Keep strokes subtle (`--hero-line`) and use accent as a controlled detail.

