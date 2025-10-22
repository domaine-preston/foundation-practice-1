<!--
⚠️ NOTE: This file is programmatically generated and will be updated automatically. Do not modify this file directly. Project-specific documentation should live elsewhere.
-->

# 🧱 Modern HTML Standards

Use evergreen, baseline-available features. Start with semantic HTML, layer CSS, then JS.

## Native Interactive Elements

- Details/summary for disclosure UI
- Dialog for modals (focus trapping/backdrop)
- `popover` attribute for lightweight menus/tooltips
- `search`, `output` for forms

## Inputs and Attributes

Use appropriate input types and HTML5 validation attributes (required, pattern, minlength, maxlength, min/max, step). Prefer client-side validation for UX.

## Containers and Structure

- Use `search` as a modern container when applicable
- Group related fields with `fieldset` and `legend`

## Progressive Enhancement

1. Semantic HTML that works without JS
2. CSS for visual enhancement
3. JS for advanced interactions and a11y
4. Polyfill only when critical

## Accessibility

- Keyboard: natural tab order, avoid positive tabindex, use `:focus-visible`
- Screen readers: semantic elements, `aria-*` when visual context isn’t enough, `aria-expanded` for collapsibles
- Motion: support `prefers-reduced-motion`

## ID Naming

Use CamelCase and include section/block IDs for uniqueness, e.g. `ProductModal-{{ product.id }}-{{ section.id }}`.

## Avoid

- Custom JS for accordions/modals/tooltips/forms that native elements cover
- Inline event handlers (`onclick`, `onsubmit`)

## Examples

- FAQ with `<details>`
- Modal with `<dialog>` (paired with custom element toggles)
- Popover menu via `popovertarget`
- Search form with `<search>` wrapper
