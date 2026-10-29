# ESLint Config

Shared ESLint flat-config presets for JavaScript, TypeScript, React, tests, JSON, YAML, TOML, and Nx workspaces.

## Installation

Requires Node.js 24+ and ESLint 9+.

```bash
npm install --save-dev @the-stranger/eslint-config
```

If you enable Nx rules, also install `@nx/eslint-plugin`:

```bash
npm install --save-dev @nx/eslint-plugin
```

Nx is optional for importing this package and using ordinary configurations. Explicit Nx options and helpers report an installation error when the peer is missing. Errors from an installed Nx plugin are not suppressed.

## Usage

Create an `eslint.config.mjs` file and export the result of `configure()`.

```javascript
// eslint.config.mjs
import { configure } from '@the-stranger/eslint-config'

export default configure()
```

Enable optional configurations by passing options:

```javascript
// eslint.config.mjs
import { configure } from '@the-stranger/eslint-config'

export default configure({
  nx: true,
  tests: {
    e2eTestRunner: 'playwright',
    unitTestRunner: 'vitest',
  },
  toml: true,
})
```

Configuration groups can be disabled entirely:

```javascript
// eslint.config.mjs
import { configure } from '@the-stranger/eslint-config'

export default configure({
  json: false,
  source: {
    react: {
      astro: true,
      typeChecked: true,
      typescript: true,
    },
  },
  yaml: false,
})
```

## Configurations

### Source

Enabled by default. Applies JavaScript and TypeScript recommendations, CommonJS rules, Prettier compatibility, and optional rule sets for JSDoc, Node.js, promises, RegExp, sorting, Unicorn, and agent skill files.

TypeScript type-aware linting is enabled by default. Strict type-checked TypeScript rules can be enabled with `source.ts.strict`.

Set `source.ts.typeChecked: false` to lint TypeScript without a TypeScript project. React TypeScript configurations also require `source.react.typeChecked: false` to avoid project-based parsing. Setting `source.ts.typescript: false` disables the ordinary TypeScript configuration, regardless of its other switches. Each `configure()` call has independent rules.

### React

Included with the source configuration for React and JSX files. Adds `@eslint-react`, React Hooks, JSX accessibility, React file-casing rules, and project React rules. Additional TypeScript and Astro handling can be enabled with `source.react.typescript`, `source.react.typeChecked`, and `source.react.astro`.

### Tests

Disabled unless `tests` options are provided. Supports Vitest or Jest for unit test files, and Playwright or Cypress for end-to-end test files. The test config also applies shared test naming rules and allows customizing disallowed words rules with `tests.disallowedWords`. Disallowed words rules are applied when using Jest, Vitest, and Playwright configs.

### JSON

JSONC parsing is enabled by default. Sorting is opt-in for Nx, TypeScript, and VS Code configuration files. Enable all presets with `json: { sort: true }` (or `json: true`), or select individual presets under `json.sort`, such as `{ nx: true }`. Unspecified sort presets remain disabled. Set `json: false` to disable JSON configuration entirely.

### YAML

Standard YAML linting is enabled by default. Sorting is opt-in for GitHub Actions, CSpell, Dependabot, markdownlint, and Yarn configuration files. Enable all presets with `yaml: { sort: true }` (or `yaml: true`), or select individual presets under `yaml.sort`, such as `{ githubActions: true }`. Unspecified sort presets remain disabled. Set `yaml: false` to disable YAML configuration entirely.

When using `@the-stranger/prettier-plugin/sorting-config`, leave both `json.sort` and `yaml.sort` disabled so Prettier owns data sorting. ESLint source sorting is independent. TOML has no data-sorting preset.

### TOML

Disabled by default. Enable with `toml: true` to lint TOML files with the recommended TOML config and this workspace's formatting rules.

### Nx

Disabled unless `nx` is set. Setting `nx: true` registers `@nx/eslint-plugin` and enables the default `@nx/enforce-module-boundaries` rule.

Use the `./nx` entry point to compose custom Nx rules:

```javascript
// eslint.config.mjs
import { configure } from '@the-stranger/eslint-config'
import { dependencyChecks, moduleBoundaries } from '@the-stranger/eslint-config/nx'

export default configure({
  nx: [
    moduleBoundaries({
      depConstraints: [
        {
          onlyDependOnLibsWithTags: ['scope:shared'],
          sourceTag: 'scope:shared',
        },
      ],
    }),
    dependencyChecks({
      buildTargets: ['build'],
    }),
  ],
})
```

## Building

```bash
yarn nx build eslint-config
```

## Running Unit Tests

```bash
yarn nx test eslint-config
```
