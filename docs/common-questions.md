<!--
⚠️ NOTE: This file is programmatically generated and will be updated automatically. Do not modify this file directly. Project-specific documentation should live elsewhere.
-->

# 📘 Common Questions: Foundation

A reference guide for common decisions and best practices when working with Foundation.

---

## 1. 💡 Dynamic Product Cards

Dynamic product cards are custom elements (e.g., `<dynamic-product-card>`) that render product data dynamically based on a product handle or variant ID. They fetch and inject product card HTML using a provided Liquid template, enabling flexible and reusable product displays.

### ✅ When to Use Dynamic Product Cards

- When integrating with third-party services like **Nosto**, **Algolia**, **Klevu**, or **wishlist apps** to render complete product cards in dynamic contexts (e.g., search results, recommendations, or wishlists).
- Instead of duplicating your product card logic in JavaScript for each platform, you can keep the card template in Liquid and reuse it via the dynamic product card. This ensures consistency, reduces duplication, and allows centralized updates.
- When product data needs to be loaded asynchronously, such as in carousels, product recommendations, or AJAX-rendered content.
- When your Liquid product card snippet is complex and affects performance. If cards are rendered below the fold (e.g., in recommendations), using dynamic product cards can drastically improve Time to First Byte (TTFB) by deferring rendering to the client.

---

## 2. 🛠️ When to Use `section-id`, `sub-section-id`, or `forceReplaceAll` with `htmlUpdate`

The `htmlUpdate` utility gives you fine control over updating HTML on the page. Choosing the right update strategy can improve performance and avoid unnecessary DOM changes.

### 🧩 `section-id`: Replace Entire Sections

Use `section-id` to replace an entire section, targeting it via its unique `data-section-id`.

**Example Use Cases:**

- Replacing a product gallery
- Swapping out a featured collection section
- Updating a full hero banner

---

### 🔍 `sub-section-id`: Granular DOM Updates

Use `sub-section-id` to update specific parts of a section—like a block or nested component—without reloading the entire section.

**Example Use Cases:**

- Updating just the price block in a product card
- Swapping a single tab panel
- Changing a content tile inside a section
- Selectively updating part of the product form on variant change
- INP Core Vitals Scores Improvements

---

### 🚨 `forceReplaceAll`: Full Replacement When Necessary

Set `forceReplaceAll: true` when:

- The section contains multiple `sub-section-id`s, but you need to replace the entire section anyway.
- A third-party app block doesn't allow granular control and requires a full refresh.
- A third-party JavaScript framework needs a full DOM reset to function properly.

**Example Use Cases:**

- Embedded app content that breaks with partial updates
- Third-party scripts that manipulate markup dynamically

---

### 🧠 Best Practice

Use the most specific strategy possible:

```text
sub-section-id > section-id > forceReplaceAll
```

Only use `forceReplaceAll` when absolutely necessary to avoid performance hits.

---

## 3. 🧩 Should You Use the `svg-icon` Web Component or `{% render 'icon', ... %}`?

### ✅ Prefer `{% render 'icon', ... %}`

Use the `{% render 'icon', ... %}` snippet for most SVG icon needs. This approach keeps the icon logic centralized, allowing global updates when props or behaviors change.

### 🔧 Use the `svg-icon` Web Component Only When Required

Only reach for the `svg-icon` web component when:

- Embedding within another web component (e.g., Lit-based components)
- Integrating with third-party platforms that don’t support Liquid

In general, default to the Liquid snippet unless you're blocked by a specific technical limitation.

---

## 4. ✨ When Should Scripts Be Included via `@needs-script` vs. Head/Body Scripts?

### ✅ Use `@needs-script` for Section-Specific JavaScript

Use `@needs-script` when a JavaScript file is only needed by a specific section or component. This optimizes performance by conditionally loading scripts only when the section is rendered.

**Examples:**

- Carousels or sliders used only on the homepage
- Product cards rendered only on collection pages
- Widgets like tabs, accordions, or modals not used globally

---

### ⚠️ Use Head/Body Scripts for Global or Non-Section Use Cases

`@needs-script` won’t work in some scenarios:

- When using components like `dynamic-product-card` inside a third-party system (e.g., Algolia) that doesn’t render sections through Shopify’s theme pipeline.
- When injecting sections via the Section Rendering API outside of the main layout, which prevents `@body-scripts` and `@needs-script` from being processed.
- When manually hotlinking a module that must be globally available regardless of section rendering.

In these cases, include the script directly in the layout using a `<script>` tag or through a custom snippet in the head/body.

---

### 🧠 Summary

- Use `@needs-script` for section-specific scripts tied to Shopify’s rendering system.
- Use head/body scripts for global functionality or third-party integrations that bypass Liquid section rendering.

---
