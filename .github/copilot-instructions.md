# GitHub Copilot Custom Instructions

These instructions guide Copilot's suggestions for this repository. They enforce architectural patterns, custom utilities, and conventions as defined in the team ruleset. **All suggestions must strictly follow these rules.**

---

## 🧱 Core Utility Components (Lit / TS)

- The `src/entry/core` directory contains abstracted utility components that serve as the foundation for Domaine's storefront tooling.
- **Never modify files in `src/entry/core` directly.**
- These components are maintained as part of ongoing system maintenance and may be programmatically overwritten.

**If you need to change or extend core functionality:**
- Create a new component that imports and composes the core component, or
- Inherit from the core component (if class-based), or
- Use composition, HOCs, or hooks to wrap/enhance the core component.

**Example:**
```tsx
// ❌ Do NOT do this:
import CoreDialog from 'src/entry/core/core-dialog';
CoreDialog.newProp = true; // Don't modify directly

// ✅ Do this:
import CoreDialog from 'src/entry/core/core-dialog';

function ExtendedDialog(props) {
  // Add new functionality here
  return <CoreDialog {...props} extraLogic />;
}
```

---

## 🔍 Liquid Development: Filters, Tags, and Objects

- **Use only the valid filters, tags, and objects listed below. Never invent new ones.**
- Prefer custom filters over raw logic for formatting or transforming data in Liquid templates.
- Validate all Liquid code for syntax, filter/tag/object usage, and theme structure.

### Valid Filters
- See the full list in the team ruleset (cart, html, collection, color, string, localization, customer, format, font, default, payment, math, array, media, metafield, money, tag, hosted_file)
- **Example usage:** `cart | item_count_for_variant: variant_id`, `string | highlight: string`, `number | money`

### Valid Tags
- Only use: `content_for`, `layout`, `include`, `render`, `javascript`, `section`, `stylesheet`, `sections`, `form`, `style`, `assign`, `capture`, `decrement`, `increment`, `break`, `continue`, `cycle`, `for`, `tablerow`, `paginate`, `else`, `case`, `if`, `unless`, `comment`, `echo`, `raw`, `liquid`
- Use `{% liquid %}` for multiline code and `{% # comments %}` for inline comments.

### Valid Objects
- Only use: `collections`, `pages`, `all_products`, `articles`, `blogs`, `cart`, `closest`, `content_for_header`, `customer`, `images`, `linklists`, `localization`, `metaobjects`, `request`, `routes`, `shop`, `theme`, `settings`, `template`, `additional_checkout_buttons`, `all_country_option_tags`, `canonical_url`, `content_for_additional_checkout_buttons`, `content_for_index`, `content_for_layout`, `country_option_tags`, `current_page`, `handle`, `page_description`, `page_image`, `page_title`, `powered_by_link`, `scripts`

### Theme Structure
- Place files in the correct directories: `sections`, `blocks`, `layout`, `snippets`, `config`, `assets`, `locales`, `templates`, `templates/customers`, `templates/metaobject`.
- Follow naming conventions and maintain proper section/block structure and schema.

---

## 🛠️ UX, Settings, and Translations

- **All text must be translatable.** Add English text only; translators will handle other languages.
- Update locale files with sensible keys and text.
- Keep settings simple, clear, and non-repetitive. Use device-agnostic language unless a setting is unique to a device.
- Order settings to match the visual order in the preview (top to bottom, left to right, background to foreground).
- Group related settings under headings (e.g., Layout, Typography, Colors, Padding).
- Use conditional settings to simplify the UI, but avoid deep or unnecessary nesting.
- Use appropriate input types (checkbox, select, etc.) and concise labels.

---

## 🖥️ Server-Side Rendering & Optimistic UI

- Render storefronts server-side with Liquid as a first principle.
- Use JavaScript for UI updates only when necessary, and prefer fetching new HTML from the server.
- Optimistic UI is allowed only for small, high-certainty updates (e.g., updating cart item count after add-to-cart, but not the cart total or line items).

---

## 💻 HTML & Accessibility

- Use semantic HTML and modern features (e.g., `<details>`, `<summary>`).
- Use `CamelCase` for IDs, appending `-{{ block.id }}` or `-{{ section.id }}` as needed.
- Ensure all interactive elements are focusable and accessible. Only use `tabindex="0"` when necessary.

---

## 🎨 CSS (Tailwind)

- Never use IDs as selectors. Avoid element selectors and `!important` (unless absolutely necessary, with comments).
- Use Tailwind utility classes for styling. Keep custom CSS minimal and use `@apply` for reusable patterns.
- Define custom values in `tailwind.config.js` and use CSS variables only for dynamic runtime values.
- Use `{% stylesheet %}` tags for section/block/snippet CSS. Avoid `{% style %}` tags with ID selectors.
- Use Tailwind's responsive prefixes and mobile-first approach.
- Avoid deep nesting and keep class lists readable.

---

## 📝 JavaScript

- Use zero external dependencies where possible. Prefer native browser features (e.g., popover, details) over JS.
- Use `const` over `let`, avoid mutation, and never use `var`.
- Use the module pattern to avoid polluting the global scope.
- Keep the public API of modules minimal; prefix private methods with `#`.
- Prefer `async/await` over `.then()` chaining.
- Use events to communicate between custom elements.
- Initialize JS components as custom elements, using shadow DOM and slots.
- Prefer early returns over nested conditionals. Use single optional chaining or early returns for multiple checks.
- Use ternaries and one-liners for simple conditionals. Return boolean comparisons directly.

---

## ⚠️ General Guidelines

- Never hardcode behavior that is abstracted in core utilities or Liquid filters.
- Always follow the extension-over-modification principle for both React and Liquid.
- Validate all code for compliance with these rules before submitting or merging changes.
