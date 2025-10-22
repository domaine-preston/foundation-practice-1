<!--
⚠️ NOTE: This file is programmatically generated and will be updated automatically. Do not modify this file directly. Project-specific documentation should live elsewhere.
-->

# 🚢 Deployments

## GitHub Actions

- Set up environments and secrets for your Shopify store and theme token.

## Running a Deployment

1. Go to GitHub > Actions.
2. Choose the correct deployment workflow.
3. Select branch, environment, and (optionally) theme ID.
4. Click "Run workflow".

## Syncing JSON Files

- JSON locale and template files are ignored by default to prevent overwriting production content.
- The deployment workflow syncs and merges JSON files from the published theme and deployment theme.
- See the [shopify-jsons-sync action](https://github.com/meetdomaine/project-syrah/blob/main/.github/workflows/deploy.yml#L77) for details.
