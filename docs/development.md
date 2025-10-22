<!--
⚠️ NOTE: This file is programmatically generated and will be updated automatically. Do not modify this file directly. Project-specific documentation should live elsewhere.
-->

# 🛠️ Development Workflow

## Local Development

- Start the dev server:
  ```bash
  npm run dev
  ```
- Stop the dev server before pushing to preview or production.

## VS Code

- Use the "Run and Debug" sidebar to start development or attach the debugger.
- Add `debugger` statements in your code to set breakpoints.

## Debugging

- Start the dev server, then use "Open Chrome & Attach Debugger" in VS Code.
- Chrome will open and connect to the VS Code debugger.

## Workflow

1. Use `[DEV] {yourname}` theme for local development.
2. Duplicate your dev theme for preview/PRs.
3. Use `shopify theme push` to deploy to a new theme.
4. Copy template JSON files as needed between themes.

## Windows Support

- Use two shells:
  1. `npm run theme:assets`
  2. `npm run theme:shopify:initial-push; npm run theme:shopify;`

## Safari Support

- Safari will often force an https protocol, which is not compatible with the Vite server. In this case, be sure to develop on localhost (http://127.0.0.1:9292/?) rather than the theme preview link.
