# @the-stranger/nx-plugin

A plugin for [Nx](https://nx.dev) that provides a set of tools that I often use in my projects.

## Generators

### CSpell config

Create a [CSpell](https://cspell.org) configuration file in a project.

### Error class

Generate a correctly implemented error class, optionally with unit tests.

### ESLint config

Generate an [ESLint](https://eslint.org) configuration file for the workspace or project.

### Jest config

Generate a [Jest](https://jestjs.io) configuration file for a project.

### Library

Generate a TypeScript library.

### Vite config

Generate a [Vite](https://vitejs.dev) (or [Vitest](https://vitest.dev)) configuration file for a project.

## Sync Generators

### Sync Vitest configs

Replace the [deprecated](https://vitest.dev/guide/migration.html#workspace-is-replaced-with-projects) `vitest.workspace` file with a
`vitest.config` project definition.

Migration stops without changing files when a root Vitest configuration already exists or both legacy workspace extensions are present. Merge the project selections manually before removing the legacy file.

## TypeScript configuration updates

The Vite generator preserves existing compiler options, including module settings, strictness, JSX settings, and path aliases. `TSConfig` preserves explicitly supplied empty `files`, `include`, `exclude`, and `compilerOptions.types` arrays because removing them changes TypeScript behavior. Synthesized empty defaults remain omitted. Clearing types with `setTypes()` or removing the final explicit type retains `types: []`.
