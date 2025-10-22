<!--
⚠️ NOTE: This file is programmatically generated and will be updated automatically. Do not modify this file directly. Project-specific documentation should live elsewhere.
-->

# 🎭 Patterns

## 📑 Table of Contents

- [🛡️ Core Files](#core-files)
- [🧩 JS/TS/Lit Usage](#js-tslit-usage)
- [💧 Liquid](#liquid)
- [🎨 Tailwind](#tailwind)

---

## 🛡️ Core Files

Core files are foundational, utility components that form the backbone of Domaine's storefront tooling and pattern library. They are intended to be **read-only** and should not be modified directly. If you need to change a core file, extend or copy it into a new file instead.

Core files can take several forms:

- **Core Blocks**: Atomic components that inherit from the pattern library. These are prefixed with `core-` (e.g., `core-button.liquid`).
- **Core Sections**: Sections designed to ingest pattern library configuration and be used with any combination of core or non-core global blocks. These are prefixed with `core-` (e.g., `core-section.liquid`).
- **Core Snippets (Utility Snippets)**: Prefixed with `@` (e.g., `@spacing-padding.liquid`). Used for spacing, color, script injection, or other common utilities in the theme or theme customizer.
- **src/entry/core Directory**: Contains abstracted utility components (JS/TS) that serve as the foundation for Domaine's storefront tooling. These are maintained as part of ongoing system maintenance and may be programmatically updated or overwritten.

**Key Points:**

- These are utility components, not feature components.
- They are part of the core system maintenance.
- They may be overwritten by automated processes.
- They should not be modified directly.

---

## 🧩 JS/TS/Lit Usage

### Adding a New Entry Point

1. Create a `.ts` or `.js` file in `src/entry/`.
2. Extend the `BaseElement` class from `src/base/`.
3. Save the file—Vite will bundle it as a theme asset.

### Entry Point Organization

- `src/entry/core/`: Core components (read-only, extend instead of editing).
- `src/entry/`: Your custom components.

#### Example

```ts
import { BaseElement } from '../base/BaseElement'

class MyComponent extends BaseElement {
  // ...
}
```

---

## 💧 Liquid

### Carousels

- Built with Swiper.js.
- Extend `SwiperElement` in `src/base/SwiperElement.ts` for custom functionality.
- Use `overflow-clip` and `whitespace-nowrap` to reduce layout shift.

### Images

- Use the `picture` snippet for responsive images (see `sections/image-banner`).
- Use the `image` snippet for single images.

---

## 🎨 Tailwind

### Glossary

### Inline Styles in Lit Components

- Create a CSS file in `src/styles/`.
- Use Tailwind's `@apply`, `@layer`, `@screen` in your CSS.
- Import with `?inline` for Vite hydration.

```css
/* src/styles/example.css */
.component {
  @apply bg-brand-primary block;
}
:host {
  @apply relative block;
}
```

```ts
// @ts-ignore
import styles from './styles/example.css?inline'

class ExampleComponent extends BaseElement {
  static styles = [unsafeCSS(styles)]
}
```

### Fonts & Design Tokens

- Override font variables in your CSS if needed:
  ```css
  @theme {
    --font-family-primary: 'Poppins';
  }
  ```

### Breakpoints

- Use standard Tailwind breakpoints (`md = 750px`, `lg = 1024px`).
- Stay consistent when setting breakpoints outside Tailwind classes.

### Customizing Swiper

- Inject custom CSS via the `injectStyles` option in Swiper.
- Use Vite's inline CSS and Tailwind utilities for custom Swiper styles.
