# Foundation Documentation

A structured, technical reference for Domaine's Foundation tooling—an opinionated starting point for headed Shopify themes.

## What is Foundation?

Foundation represents a modern approach to Shopify theme development, incorporating modern web standards and performance-first principles:

**Web-native and performance-first**: Built with the latest web technologies while maintaining backward compatibility through progressive enhancement. Every feature is evaluated for its impact on performance and user experience.

**TypeScript and modern tooling**: Leverages TypeScript, Vite, Tailwind CSS, and modern build processes to ensure type safety, developer experience, and maintainable code.

**Component-driven architecture**: Utilizes Shopify's theme blocks and a systematic approach to reusable components, with clear separation between core utilities and custom implementations.

**Accessibility by design**: WCAG 2.2 compliance is built into the foundation, with automated contrast checking and accessibility-first component patterns.

**Extension over modification**: Core components are read-only utilities designed to be extended rather than modified, ensuring upgrade paths and system stability.

## Docs Overview

- **standards/**: Global coding and authoring standards
  - css-standards.md — Tailwind-first CSS, tokens, specificity, performance, a11y
  - html-standards.md — Native-first HTML patterns, progressive enhancement, a11y
  - accessibility-color-contrast.md — WCAG 2.2 contrast targets and examples
  - patterns.md — High-level patterns across JS/TS/Liquid/Tailwind
  - prompts-and-references.md — Living docs policy for collaborators/agents
- **objects/**: Implementable theme building blocks
  - blocks.md — Theme blocks, structure, static/nested usage
  - sections.md — Section scaffolds, schema, performance patterns
  - snippets.md — Snippet conventions, params, docs, testing notes
  - core-snippets.md — Core utility conventions, params, docs, testing notes
  - templates.md — JSON template structure and examples
  - schemas.md — Authoring schemas with TS + build pipeline
  - theme-settings.md — `config/settings_schema.json` guidelines
  - localization.md — Translation keys and interpolation

## Getting Started

- **getting-started.md** — Repo setup, theme init, CORS configuration
- **development.md** — Local dev environment, debugging workflows, hot reloading
- **deployments.md** — CI/CD workflows and JSON template synchronization
- **common-questions.md** — FAQ for Core-specific architectural decisions

### Build System

**Vite + TypeScript**: Fast development server and optimized production builds with full TypeScript support.

**Tailwind CSS**: Utility-first CSS framework with custom design tokens and accessibility-focused configuration.

Run the development environment:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

### Theme Check

We use Theme Check for Shopify theme validation and linting:

```bash
shopify theme check
```

Theme Check is configured to work with our custom patterns and will validate Liquid templates, accessibility standards, and performance best practices.

### Continuous Integration

The project uses automated workflows to maintain code quality:

- **Theme Check**: Validates all Liquid templates and theme structure
- **TypeScript**: Type checking for all JavaScript/TypeScript code
- **Accessibility**: Automated contrast ratio validation
- **Performance**: Bundle size analysis and optimization warnings

## Contributing Guidelines

### Core Component Philosophy

- **Do not modify files under `core/` directories**: Core components in `src/entry/core/`, `blocks/core-*`, `sections/core-*`, and `snippets/@*` are read-only utilities
- **Extend, don't modify**: Create new components that inherit from or compose core components
- **Copy and customize**: For Liquid components, copy core files to new files with custom names

### Standards Compliance

- **Follow established patterns**: Refer to documentation under `standards/` for CSS, HTML, and accessibility guidelines
- **Maintain accessibility**: All changes must meet WCAG 2.2 Level AA requirements
- **Performance first**: New features must justify their performance impact

### Documentation Maintenance

- **Living documents**: All documentation files are living documents that should be updated when new patterns or solutions are discovered
- **Immediate updates**: When encountering new patterns, edge cases, or solutions while working, update the relevant documentation immediately
- **Real-world examples**: Add examples from actual implementation experiences to help future developers

### Code Accessibility

- **Progressive enhancement**: Ensure functionality works without JavaScript, then enhance with interactive features
