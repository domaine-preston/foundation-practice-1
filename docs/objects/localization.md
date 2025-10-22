<!--
⚠️ NOTE: This file is programmatically generated and will be updated automatically. Do not modify this file directly. Project-specific documentation should live elsewhere.
-->

# 🌐 Localization & Locales

All user-facing text must be translated via Liquid filters with organized keys and safe interpolation.

## Requirements

- Use `{{ 'key' | t }}` for all text
- Add keys to `locales/en.default.json`; translators handle others
- Use hierarchical, descriptive keys (snake_case, max 3 levels)

## Interpolation

```liquid
<p>
  {{ 'products.price_range' | t: min: product.price_min | money, max: product.price_max | money }}
</p>
<p>
  {{
    'general.pagination.page'
    | t: page: paginate.current_page, pages: paginate.pages
  }}
</p>
```

```json
{
  "products": { "price_range": "From {{ min }} to {{ max }}" },
  "general": { "pagination": { "page": "Page {{ page }} of {{ pages }}" } }
}
```

## File Layout

```
locales/
├── en.default.json
├── es.json
├── fr.json
└── de.json
```

## Content Guidelines

- Clear, concise UI text; consistent terminology
- Escape variables when not outputting HTML: `{{ variable | escape }}`
