# @the-stranger/nx-plugin-internal

Private Nx generators and executors used to maintain this workspace. This package is not a consumer-facing API; reusable Nx functionality belongs in [`packages/nx-plugin`](../../packages/nx-plugin).

## Generator

### ESLint config

Generate the repository's default root ESLint configuration:

```shell
yarn nx generate @the-stranger/nx-plugin-internal:eslint-config --project=
```

Pass a project name to generate `eslint.config.mjs` in that project's root. By default, it extends the workspace root config; `--extend` selects another base config.

```shell
yarn nx generate @the-stranger/nx-plugin-internal:eslint-config --project=eslint-utils
```

For root generation, `configureOptions` overrides the default `configure()` options and `additionalConfigs` appends JavaScript expressions to that call. Use `force` to overwrite an existing config and `dryRun` to preview changes.

## Executors

Executors are configured as targets in `project.json` or as shared defaults in `nx.json` and run with `yarn nx run <project>:<target>`.

### Build package

`build-package` delegates TypeScript compilation to `@nx/js:tsc`, then finalizes the generated package metadata so paths resolve relative to the project-local `dist` directory. `main`, `outputPath`, and `tsConfig` are required; it also supports the `@nx/js:tsc` asset, transformer, watch, clean, `rootDir`, and `generatePackageJson` options.

```json
{
  "build": {
    "executor": "@the-stranger/nx-plugin-internal:build-package"
  }
}
```

This workspace supplies the common build options through `targetDefaults` in `nx.json`.

### Release

`release` versions packages with Nx Release and publishes only when a new version is resolved. A real publish obtains the six-digit npm one-time password from the 1Password CLI item named `NPM`. A dry run changes nothing, does not request an OTP, and does not publish.

```shell
yarn nx run root:release --specifier=patch --dryRun
```

Options are `specifier`, `preid`, `firstRelease`, `groups`, `projects`, `verbose`, and `dryRun`. `groups` and `projects` are mutually exclusive.

### Workspace dependencies

`workspace-dependencies` replaces workspace dependency ranges in a destination `package.json` with concrete workspace versions. `resolvedVersionPrefix` can be `^` (the default), `~`, or an empty string. Without `source`, it reads the current project's manifest; without `destination`, it searches the project's build output.

Set `stage` to copy the publish manifest, README, Markdown documentation, workspace license, and runtime `dist` files into a clean destination before resolving dependencies. Staging requires an explicit `destination`. The workspace uses this executor through the shared `prepare-publish` target:

```shell
yarn nx run eslint-utils:prepare-publish
```

### Write file header

`write-file-header` prepends a string or array of lines to each existing file in `files`, followed by a blank line. Missing files are skipped.

```json
{
  "write-directive-header": {
    "executor": "@the-stranger/nx-plugin-internal:write-file-header",
    "options": {
      "files": ["packages/example/dist/index.d.ts"],
      "header": ["// Generated declaration metadata", "/// <reference path=\"./types.d.ts\" preserve=\"true\" />"]
    }
  }
}
```

## Development

Build and test this project through Nx:

```shell
yarn nx build nx-plugin-internal
yarn nx test nx-plugin-internal
```
