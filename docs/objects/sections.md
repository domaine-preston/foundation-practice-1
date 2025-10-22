<!--
⚠️ NOTE: This file is programmatically generated and will be updated automatically. Do not modify this file directly. Project-specific documentation should live elsewhere.
-->

# 🧭 Sections

Section scaffolds structure pages and host blocks. Core sections are read-only; extend via copy.

## Core Sections

- Prefix: `core-` (e.g., `core-section.liquid`)
- Do not edit directly; duplicate and evolve for project-specific needs

## Requirements

- Valid `{% schema %}` JSON
- Semantic HTML
- Scoped CSS within the section
- Translation keys for all text

## Structure

```liquid
{% liquid
  assign section_id = section.settings.custom_id | default: section.id
  assign section_class = 'section-' | append: section.type
%}

<section
  id='{{ section_id }}'
  class='{{ section_class }}'
  style='--pt: {{ section.settings.padding_top }}px; --pb: {{ section.settings.padding_bottom }}px;'
>
  <div class='page-width'>
    {% content_for 'blocks' %}
  </div>
</section>

{% stylesheet %}
  .{{ section_class }} { padding-top: var(--pt, 40px); padding-bottom: var(--pb, 40px); }
{% endstylesheet %}

{% schema %}
{
  "name": "t:names.section_name",
  "tag": "section",
  "blocks": [{ "type": "@theme" }, { "type": "@app" }],
  "settings": []
}
{% endschema %}

## Performance

- Lazy load images by default; for first 2–3 sections, prefer eager +
`fetchpriority='high'` for LCP - Scope CSS variables to the section; use
container queries for responsiveness
```
