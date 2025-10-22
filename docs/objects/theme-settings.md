<!--
⚠️ NOTE: This file is programmatically generated and will be updated automatically. Do not modify this file directly. Project-specific documentation should live elsewhere.
-->

# ⚙️ Theme Settings Schema

Author global settings in `config/settings_schema.json` with clear categories and constraints.

## Structure

```json
{
  "name": "theme_info",
  "theme_name": "Theme Name",
  "theme_version": "1.0.0",
  "theme_author": "Author Name",
  "theme_documentation_url": "https://…",
  "theme_support_url": "https://…"
},
{
  "name": "Colors",
  "settings": [
    { "type": "header", "content": "Brand Colors" },
    { "type": "color", "id": "color_primary", "label": "Primary", "default": "#121212" }
  ]
}
```

## Categories

- Typography: `font_picker`, size `range`, weight `select`
- Layout: spacing `range`, layout `select`, feature toggles `checkbox`
- Performance: lazy-load `checkbox`, image quality `select`, pagination `number`
