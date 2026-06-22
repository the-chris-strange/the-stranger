# ESLint Config

Shared ESLint flat-config presets for JavaScript, TypeScript, React, tests,
JSON, YAML, TOML, and Nx workspaces.

## Installation

Requires Node.js 24+ and ESLint 9+.

```bash
npm install --save-dev @the-stranger/eslint-config
```

If you enable Nx rules, also install `@nx/eslint-plugin`:

```bash
npm install --save-dev @nx/eslint-plugin
```

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

Enabled by default. Applies JavaScript and TypeScript recommendations, source
rules, CommonJS rules, Prettier compatibility, and optional rule sets for JSDoc,
Node.js, promises, regular expressions, sorting, Unicorn, and agent skill files.

TypeScript type-aware linting is enabled by default. Strict type-checked
TypeScript rules can be enabled with `source.ts.strict`.

### React

Included with the source configuration for React and JSX files. Adds
`@eslint-react`, React Hooks, JSX accessibility, React file-casing rules, and
project React rules. Additional TypeScript and Astro handling can be enabled
with `source.react.typescript`, `source.react.typeChecked`, and
`source.react.astro`.

### Tests

Disabled unless `tests` options are provided. Supports Vitest or Jest for unit
test files, and Playwright or Cypress for end-to-end test files. The test config
also applies shared test naming rules and lets you customize disallowed words
with `tests.disallowedWords`.

### JSON

Enabled by default. Adds JSONC parsing and sorting rules for Nx, TypeScript, and
VS Code configuration files. Individual sort presets can be disabled under
`json.sort`.

### YAML

Enabled by default. Adds standard YAML linting and sorting rules for cspell,
Dependabot, GitHub Actions, markdownlint, and `.yarnrc.yml` files. Individual
sort presets can be disabled under `yaml.sort`.

### TOML

Disabled by default. Enable with `toml: true` to lint `*.toml` files with the
recommended TOML config and this workspace's formatting rules.

### Nx

Disabled unless `nx` is set. `nx: true` registers `@nx/eslint-plugin` and enables
the default `@nx/enforce-module-boundaries` rule.

Use the `./nx` entry point when you need to compose custom Nx rules:

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
