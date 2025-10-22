# Sync Workflow Setup

This document outlines the requirements and setup instructions for the automated Sync workflow that keeps Foundation files synchronized between the base repository and project repositories.

## Overview

The Sync workflow (`.github/workflows/sync.yml`) automatically syncs Foundation files from the base repository to maintain consistency across projects. It runs weekly on Mondays at 4 AM UTC and can be triggered manually.

## Files Synchronized

The workflow syncs the following core file patterns:

### Core TypeScript/JavaScript Components

- `src/entry/core/**` - Core utility components and abstractions

### Core Liquid Templates

- `blocks/core-*.liquid` - Atomic components prefixed with `core-`
- `sections/core-*.liquid` - Sections prefixed with `core-`
- `snippets/@*.liquid` - Utility snippets prefixed with `@`

### Documentation

- `docs/**` - All documentation files and subdirectories

## Required Secrets

The following GitHub secrets must be configured in the target repository for the workflow to function:

### `FOUNDATION_SYNC`

- **Type**: Personal Access Token (PAT) or Fine-grained Token
- **Purpose**: Allows checkout of the base repository
- **Required Permissions**:
  - `contents:read` - Read repository contents
  - `metadata:read` - Read repository metadata
- **Setup**:
  1. Generate a PAT with the required permissions
  2. Add it as a repository secret named `FOUNDATION_SYNC`

### `ANTHROPIC_API_KEY`

- **Type**: Anthropic API Key
- **Purpose**: Powers AI-generated summaries for changes and new files
- **Required**: Valid Anthropic API key with access to `claude-3-5-sonnet-20241022`
- **Setup**:
  1. Obtain an API key from Anthropic
  2. Add it as a repository secret named `ANTHROPIC_API_KEY`

### `GITHUB_TOKEN`

- **Type**: Automatic GitHub Token
- **Purpose**: Creates pull requests with sync changes
- **Setup**: Automatically provided by GitHub Actions (no manual setup required)
- **Required Permissions**: The repository must allow GitHub Actions to create PRs

## Repository Configuration

### GitHub Actions Permissions

Ensure the following permissions are enabled in your repository settings:

1. **Actions > General > Workflow permissions**:

   - ✅ Read and write permissions
   - ✅ Allow GitHub Actions to create and approve pull requests

2. **Actions > General > Fork pull request workflows**:
   - Configure based on your security requirements

### Branch Protection

If you have branch protection rules on `main`, ensure:

- The workflow can create branches (for `foundation-auto-update`)
- Pull requests can be created from the workflow

## Workflow Behavior

### Sync Strategy

- **Additive Only**: Only adds new files or updates existing files
- **Non-Destructive**: Never deletes files from the target repository
- **Core Files Only**: Only syncs files matching the core patterns

### Pull Request Creation

- Creates PRs on the `foundation-auto-update` branch
- Includes AI-generated summaries of changes
- Provides file-by-file change descriptions
- Tags `@domaine-jay` for review

### Scheduling

- **Automatic**: Every Monday at 4 AM UTC
- **Manual**: Can be triggered via GitHub Actions UI
- **Event**: `workflow_dispatch` and `schedule`

## Troubleshooting

### Common Issues

#### "Repository not found" Error

- **Cause**: Invalid or missing `FOUNDATION_SYNC` token
- **Solution**: Verify the token has correct permissions and hasn't expired

#### "Anthropic API Error"

- **Cause**: Invalid or missing `ANTHROPIC_API_KEY`
- **Solution**: Check API key validity and account quota

#### "Permission denied" on PR Creation

- **Cause**: Insufficient GitHub Actions permissions
- **Solution**: Enable "Allow GitHub Actions to create and approve pull requests"

#### No Changes Detected

- **Cause**: All core files are already up to date
- **Behavior**: Workflow exits successfully without creating a PR

### Logs and Debugging

Check the GitHub Actions logs for detailed information:

1. Go to Actions tab in your repository
2. Select the "Sync (Anthropic)" workflow
3. Review the step-by-step logs for errors

## Manual Sync

To manually trigger a sync:

1. Go to Actions tab in your repository
2. Select "Sync (Anthropic)" workflow
3. Click "Run workflow"
4. Select the branch (usually `main`)
5. Click "Run workflow"

## Customization

### Modifying Sync Patterns

To add or modify which files are synchronized, edit the sync patterns in `.github/workflows/sync.yml`:

```bash
# Add new sync pattern
sync_files "new/pattern/*.liquid" "new/pattern/" "new/pattern/"
```

### Changing Schedule

Modify the cron expression in the workflow file:

```yaml
schedule:
  - cron: '0 4 * * MON' # Every Monday at 4 AM UTC
```

## Security Considerations

- **Token Scope**: Use minimal required permissions for `FOUNDATION_SYNC`
- **API Keys**: Regularly rotate Anthropic API keys
- **Branch Protection**: Consider requiring reviews for the auto-generated PRs
- **Monitoring**: Set up notifications for failed workflow runs

## Support

For questions or issues with the Sync workflow:

- Tag `@domaine-jay` in GitHub issues
- Review this documentation for common solutions
- Check GitHub Actions logs for detailed error information
