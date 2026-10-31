# Workspace development

- Install tools with `mise install`; run commands with an activated mise shell or `mise exec --`.
- `mise.toml` enables `idiomatic_version_file_enable_tools = ["node", "pnpm"]`.
- Pin pnpm in root `package.json#packageManager` and development Node in `devEngines.runtime`; do not duplicate pins in mise.toml.
- Published Node compatibility is `^24 || ^26`; keep Node 24 types and validate both majors.
- Use `pnpm nx` for tasks and `pnpm constraints` for manifest checks.
- Internal dependencies use `workspace:*`; rely on pnpm packaging to resolve versions.
- Preserve public Yarn utilities. Obtain approval before optional dependency upgrades.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->
