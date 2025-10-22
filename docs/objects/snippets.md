<!--
⚠️ NOTE: This file is programmatically generated and will be updated automatically. Do not modify this file directly. Project-specific documentation should live elsewhere.
-->

# 🔗 Snippets

Small, reusable Liquid fragments. Follow parameter hygiene and documentation conventions. Core utility snippets (prefixed `@`) are read-only—extend by copying.

## Core Utility Snippets

- Prefix: `@` (e.g., `@spacing-padding`, `@color-background`, `@needs-script`)
- Do not edit directly; copy to a new, non-`@` name to customize

See `docs/core/core-snippets.md` for catalog and usage.

## Documentation Block

Each snippet should self-document with LiquidDoc-style comments and an example.

```liquid
{% doc %}
  Product Card

  @param product - {Object} Product (required)
  @param show_vendor - {Boolean} default: false
  @param image_ratio - {String} default: 'adapt'

  @example
  {% render 'product-card', product: product, show_vendor: true %}
{% enddoc %}
```

## Parameter Handling

- Provide defaults via `{% liquid %}`
- Validate required params; early return with a clear HTML comment when missing

```liquid
{% liquid
  assign product = product | default: empty
  unless product != empty
    echo '<!-- Error: product required for product-card -->'
    break
  endunless
%}
```

## Common Patterns

- Icon maps, price formatting, badges, image tags
- Keep business logic minimal—compute in sections/blocks, render in snippets

## Testing Notes

Document edge cases in comments (no image, compare_at_price, unit pricing, out-of-stock, with/without variants).
