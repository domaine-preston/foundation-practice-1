<!--
⚠️ NOTE: This file is programmatically generated and will be updated automatically. Do not modify this file directly. Project-specific documentation should live elsewhere.
-->

# ♿ Accessibility — Color Contrast

Enforce WCAG 2.2 1.4.3 (Text) and 1.4.11 (Non-text) contrast. Our tooling flags likely failures across CSS, HTML, and Liquid.

## Targets

- Text contrast: 4.5:1 (normal), 3:1 (large). AAA: 7:1 / 4.5:1.
- Non-text (UI, focus, icons): 3:1 minimum.

## High-Contrast Pairs

- Dark on light: `#212529` on `#ffffff`, `#495057` on `#ffffff`, etc.
- Light on dark: `#ffffff` on `#212529`, `#ffffff` on `#0056b3`.

## Implementation

```css
.primary-text {
  color: #212529;
  background: #fff;
}
.form-control {
  border: 2px solid #ced4da;
  background: #fff;
}
.form-control:focus {
  border-color: #0056b3;
  outline: 3px solid #0056b3;
}
.btn-primary {
  background: #0056b3;
  color: #fff;
  border: 1px solid #004085;
}
```

### prefers-contrast

```css
@media (prefers-contrast: more) {
  .button {
    background: #000;
    color: #fff;
    border: 2px solid #fff;
  }
  .form-control {
    border-width: 3px;
  }
}
```

## Icons

- Treat informative icons as UI components; ensure 3:1 against background.
- For decorative icons, set `aria-hidden="true"`.

## Testing

- Use browser contrast checkers and WebAIM
- Verify automated checks and test in light/dark and various lighting conditions
