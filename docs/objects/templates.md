<!--
⚠️ NOTE: This file is programmatically generated and will be updated automatically. Do not modify this file directly. Project-specific documentation should live elsewhere.
-->

# 🗂️ Templates

JSON templates define page composition via sections and order. Must follow strict structure.

## Required Structure

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["sections"],
  "properties": {
    "sections": {
      "type": "object",
      "patternProperties": {
        "^[a-zA-Z0-9_-]+$": {
          "type": "object",
          "required": ["type"],
          "properties": {
            "type": { "type": "string", "pattern": "^[a-zA-Z0-9_-]+$" },
            "settings": { "type": "object" },
            "blocks": {
              "type": "array",
              "items": {
                "type": "object",
                "required": ["type"],
                "properties": {
                  "type": { "type": "string" },
                  "settings": { "type": "object" }
                }
              }
            }
          }
        }
      }
    },
    "order": { "type": "array", "items": { "type": "string" } }
  }
}
```

## Types

- Standard: `index.json`, `product.json`, `collection.json`, `page.json`, `blog.json`, `article.json`, `cart.json`, `search.json`
- Alternate: `template.suffix.json` (e.g., `product.alternate.json`)

## Example (Product)

```json
{
  "sections": {
    "header": { "type": "header" },
    "main": {
      "type": "main-product",
      "settings": { "show_vendor": true },
      "blocks": { "title": { "type": "title" }, "price": { "type": "price" } },
      "block_order": ["title", "price"]
    },
    "footer": { "type": "footer" }
  },
  "order": ["header", "main", "footer"]
}
```
