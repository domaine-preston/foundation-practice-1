<!--
⚠️ NOTE: This file is programmatically generated and will be updated automatically. Do not modify this file directly. Project-specific documentation should live elsewhere.
-->

# 🧩 Blocks

Reusable, theme-level components rendered under sections. Core blocks are read-only; extend via copy.

## Core Blocks

- Prefix: `core-` (e.g., `core-button.liquid`)
- Do not modify directly; copy to `custom-*.liquid` and evolve

## Fundamentals

- Blocks can be nested under sections or other blocks
- Configurable via schema settings; usable as static or dynamic blocks

## Basic Structure

```liquid
{% doc %}
  Block description and usage
{% enddoc %}

<div {{ block.shopify_attributes }} class='block-name'>…</div>

{% stylesheet %}
  /* Scoped styles */
{% endstylesheet %}

{% schema %}
{ "name": "Block Name", "settings": [], "presets": [] }
{% endschema %}
```

## Static Blocks

Render predetermined blocks directly in templates to guarantee presence and IDs.

```liquid
{% content_for 'block', type: 'text', id: 'header-announcement' %}
```

## Nested Blocks

Allow children via `{% content_for 'blocks' %}`.

```liquid
<div class='container' {{ block.shopify_attributes }}>
  {% content_for 'blocks' %}
</div>
```

## Targeting

In section schemas you can opt into all theme/app blocks or restrict to specific types.

```json
{ "blocks": [{ "type": "@theme" }, { "type": "@app" }] }
```

## Performance

- Use `{% liquid %}` for logic
- Conditionally render to avoid empty markup
- Use CSS variables for per-instance styling
