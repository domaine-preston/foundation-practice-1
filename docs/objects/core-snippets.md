<!--
⚠️ NOTE: This file is programmatically generated and will be updated automatically. Do not modify this file directly. Project-specific documentation should live elsewhere.
-->

# 🛡️ Core Utility Snippets

Core utility snippets are reusable Liquid files, always prefixed with `@`, that provide foundational design tokens and utility classes for the theme. These snippets are intended to be included or imported in other templates, sections, or snippets to ensure consistent spacing, color, and typography across the storefront. They are part of the core system and should not be modified directly.

## Table of Contents

- [@spacing-padding](#spacing-padding)
- [@spacing-token](#spacing-token)
- [@color-text](#color-text)
- [@color-mode-token](#color-mode-token)
- [@text-color-class](#text-color-class)
- [@color-background](#color-background)

---

## @spacing-padding

Defines and injects standard padding utilities and variables for consistent spacing throughout the theme. Used to apply global or component-level padding, ensuring alignment with the design system's spacing scale.

**Usage:**

- Included in section, block, or snippet templates where consistent padding is required.
- Helps maintain vertical and horizontal rhythm across components.

**Best Practices:**

- Use the provided classes or variables instead of hardcoding padding values.

**Implementation:**

- Include the snippet in your Liquid file:
  ```liquid
  {% render '@spacing-padding' %}
  ```
- Use the generated classes or variables in your markup:
  ```liquid
  <div class='padding-md'>...</div>
  ```
  (Replace `padding-md` with the actual class or variable provided by the snippet.)

---

## @spacing-token

Provides a set of spacing tokens (variables) that represent the theme's spacing scale (e.g., small, medium, large). These tokens are referenced by other snippets and components to ensure spacing consistency.

**Usage:**

- Used by other core snippets and in custom components to reference spacing values.
- Ensures all spacing in the theme is derived from a single source of truth.

**Best Practices:**

- Reference these tokens in your custom snippets or sections for consistent spacing.

**Implementation:**

- Include the snippet in your Liquid file:
  ```liquid
  {% render '@spacing-token' %}
  ```
- Use the spacing variables in your CSS or inline styles:
  ```css
  .my-class {
    padding: var(--spacing-md);
  }
  ```
  (Replace `--spacing-md` with the actual variable provided by the snippet.)

---

## @color-text

Defines the primary text color variables and utility classes for the theme. Ensures that text color is consistent and easily adjustable via design tokens.

**Usage:**

- Included in templates and snippets to apply the correct text color.
- Used in conjunction with color mode tokens for light/dark mode support.

**Best Practices:**

- Always use the provided text color classes or variables for text elements.

**Implementation:**

- Include the snippet in your Liquid file:
  ```liquid
  {% render '@color-text' %}
  ```
- Use the generated classes or variables in your markup:
  ```liquid
  <span class='text-primary'> This is primary text. </span>
  ```
  (Replace `text-primary` with the actual class or variable provided by the snippet.)

---

## @color-mode-token

Provides color mode (e.g., light/dark) variables and logic. Allows the theme to dynamically switch between color modes and ensures all color tokens respond appropriately.

**Usage:**

- Included in the theme's main layout or head to set up color mode variables.
- Referenced by other color-related snippets to adapt to the current mode.

**Best Practices:**

- Use these tokens to ensure your components are color mode aware.

**Implementation:**

- Include the snippet in your main layout or head:
  ```liquid
  {% render '@color-mode-token' %}
  ```
- Reference the color mode variables in your CSS:
  ```css
  body {
    background-color: var(--color-background);
    color: var(--color-text);
  }
  ```
  (Replace `--color-background` and `--color-text` with the actual variables provided by the snippet.)

---

## @text-color-class

Defines utility classes for text color, mapping design tokens to CSS classes. Allows for easy application of text color via class names in Liquid templates.

**Usage:**

- Add the appropriate class to elements to apply the correct text color.
- Used in conjunction with @color-text and @color-mode-token.

**Best Practices:**

- Prefer these utility classes over inline styles for text color.

**Implementation:**

- Include the snippet in your Liquid file:
  ```liquid
  {% render '@text-color-class' %}
  ```
- Use the generated classes in your markup:
  ```liquid
  <p class='text-secondary'>This is secondary text.</p>
  ```
  (Replace `text-secondary` with the actual class provided by the snippet.)

---

## @color-background

Defines background color variables and utility classes for the theme. Ensures backgrounds are consistent and respond to color mode changes.

**Usage:**

- Included in templates and snippets to apply background colors.
- Used for both global backgrounds (e.g., body) and component backgrounds.

**Best Practices:**

- Use the provided background color classes or variables for all background styling.

**Implementation:**

- Include the snippet in your Liquid file:
  ```liquid
  {% render '@color-background' %}
  ```
- Use the generated classes or variables in your markup:
  ```liquid
  <section class='bg-surface'>...</section>
  ```
  (Replace `bg-surface` with the actual class or variable provided by the snippet.)
