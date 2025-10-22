<!--
⚠️ NOTE: This file is programmatically generated and will be updated automatically. Do not modify this file directly. Project-specific documentation should live elsewhere.
-->

# 🎨 CSS Standards

Tailwind-first, tokens-driven styling with strict simplicity rules. Use utilities by default; write scoped CSS only when utilities cannot express the requirement.

## Tailwind First

- Layout, spacing, typography, color, state, responsive: use utilities.
- Group related utilities for readability.

```html
<div
  class="gap-y-sm p-md bg-background text-foreground hover:bg-background-secondary md:gap-x-md flex flex-col rounded-sm md:flex-row"
></div>
```

## When to Write CSS

- Complex keyframe animations
- Vendor-specific overrides
- Runtime-dynamic values via Liquid variables
- Third‑party overrides, complex pseudo selectors

Prefer `{% stylesheet %}` in the same Liquid file; otherwise `src/styles/*`.

## Utilities and @apply

- Create semantic utilities for repeated patterns.

```css
@utility btn {
  @apply rounded-full px-6 py-3 tracking-[0.05em] uppercase transition-colors;
}
@utility card {
  @apply bg-background border-border-01 p-md rounded-sm border shadow-sm;
}
```

## Color System

- Use semantic classes backed by tokens: `bg-background`, `text-foreground`, `border-border-01`.
- Avoid arbitrary hex values; prefer tokens and design-system variables.

## Dynamic CSS Variables

Use inline style variables for per-instance values from Liquid.

```liquid
<section
  class='py-sm'
  style='--section-padding: {{ section.settings.padding }}px; --bg: {{ section.settings.background_color }};'
>
  <div class='p-(--section-padding) bg-[--bg]'>…</div>
</section>
```

## Specificity & Naming (when writing CSS)

- Target with class selectors (0 1 0). Avoid IDs and `!important`.
- Use BEM for rare traditional CSS; utilities otherwise.

```css
.product-card {
}
.product-card__title {
}
.product-card--featured {
}
```

## Nesting Rules

- One level only (except media queries/states). Keep selectors simple.

## Accessibility

- Respect `prefers-reduced-motion`; avoid animating layout properties.
- Maintain WCAG AA contrast; provide visible focus with `:focus-visible`.

## Performance

- Favor transforms/opacity in animations; use `contain` for complex components.
- Minimize custom CSS; prefer utilities and tokens.

## Tailwind v4 Integration

- Define tokens in `src/styles/@theme.css`.
- Use inline imports `?inline` for component-scoped styles in web components.

```css
@theme {
  --font-family-primary: 'GT Alpina';
  --max-width-container: 1400px;
}
```

## Common Pitfalls

- Overusing CSS variables for static values
- Deep selector nesting
- Inline event-driven styles instead of component states
- Arbitrary colors instead of tokens
