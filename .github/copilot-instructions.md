# Contributor guidelines

## General guidelines for the development environment

- Prefix commands related to dependencies and Node.js scripts with `pnpm`, e.g., `pnpm add`, `pnpm build`, `pnpm test`, etc.
- When adding new dependencies:
  - use `pnpm add -D {...dependencies}` to add them to the workspace manifest as dev dependencies
  - if applicable, add dependencies to the relevant package's manifest using `pnpm --filter <package-name> add {...dependencies}` or `pnpm --filter <package-name> add -D {...dependencies}` for dev dependencies
- The project uses [Nx](https://nx.dev/) as a build system and monorepo manager. Refer to the documentation, or the nx instructions file (.github/instructions/nx.instructions.md), for usage details.
- Before committing code, ensure that the project builds successfully, all tests pass, and lint/formatting rules are applied. Use `pnpm nx run-many -t lint test build` to verify.

## Code quality and style

- Use clear, descriptive function and variable names that match their purpose.
- Keep functions small and composable. Use pure functions whenever possible.
- Use comments to indicate intent when it's not obvious.
