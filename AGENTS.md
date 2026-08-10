# Workspace Context

The Stranger is a TypeScript monorepo containing opinionated, reusable developer tools packages. Its goal is to encode shared conventions once and expose them through consumer-facing ESLint, Prettier, Yarn, and Nx packages.

Favor clear public APIs, predictable generated output, and reusable solutions over workspace-specific shortcuts.

## Repository Map

- `packages/*` contains public, independently released packages.
- `tools/*` contains private tools used to maintain this workspace.
- `packages/nx-plugin` is the public Nx plugin for consumers.
- `tools/nx-plugin` is the private Nx plugin for this repository. Do not treat its APIs or generators as public contracts.
- Each package README documents its consumer-facing purpose and usage.

## Working Agreements

- This workspace uses Yarn 4 and Node.js 24. Prefix Nx commands with `yarn`, for example `yarn nx show projects`.
- Keep changes scoped to the affected project unless the behavior is intentionally shared.
- Treat exported APIs, generator schemas, generated files, and package documentation as public contracts.
- Validate the affected project through its Nx targets first.
- For cross-project or workspace-wide changes, run `yarn ci`.
- Update tests and documentation when public behavior changes.
- Do not edit content between the Nx-managed configuration markers manually.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

### Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

### When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->
