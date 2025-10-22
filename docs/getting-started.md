<!--
⚠️ NOTE: This file is programmatically generated and will be updated automatically. Do not modify this file directly. Project-specific documentation should live elsewhere.
-->

# 🚀 Getting Started

## Prerequisites

- Node.js (see package.json for version)
- npm
- Shopify CLI

## Installation

```bash
git clone https://github.com/meetdomaine/foundation.git
cd foundation
npm install
```

## Theme Setup

1. Run `npx @meetdomaine/cli theme init` to set up a new theme project.
2. Create `shopify.theme.toml` from `shopify.theme.example.toml` and fill in your store details.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up your development theme:
   ```bash
   npx @meetdomaine/cli@latest theme setup
   ```

## CORS Configuration

If using a custom domain, add it to the allowed origins in `vite.config.ts`:

```js
origin: [defaultAllowedOrigins, /\.myshopify\.com$/, 'https://custom-store-domain.com'],
```
