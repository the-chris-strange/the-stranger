# @the-stranger/eslint-plugin

ESLint plugin that provides shared rule presets plus utilities for authoring ESLint config.

## Installation

Requires Node.js 24+ and ESLint 9+.

```bash
npm install --save-dev @the-stranger/eslint-plugin
```

## Usage

In your `eslint.config.js`, extend the presets you want:

```javascript
import le from '@the-stranger/eslint-plugin'
import leNx from '@the-stranger/eslint-plugin/configs/nx'
import { setRuleLevel } from '@the-stranger/eslint-plugin/utils'
import { defineConfig } from 'eslint/config'

export default defineConfig({
  extends: [
    // all-in-one
    le.configs.standard,

    // or pick and choose
    le.configs.jsdoc,
    le.configs.jsonc,
    le.configs.n,
    le.configs.perfectionist,
    le.configs.promise,
    le.configs.regexp,
    le.configs.ts,
    le.configs.unicorn,
    le.configs.yml,
    le.configs.vitest,

    // customization helpers
    setRuleLevel('error', le.configs.perfectionist),
  ],
})
```

## Optional peer dependencies

Install [@nx/eslint-plugin] to enable the Nx preset:

```bash
npm install --save-dev @nx/eslint-plugin@^21
```

Then, in your ESLint config, extend the Nx preset:

```javascript
import leNx from '@the-stranger/eslint-plugin/nx'
import { defineConfig } from 'eslint/config'

export default defineConfig({
  extends: [leNx],
})
```

## Configurations

- **All**: Includes every available preset in this package.
- **Astro**: Uses [eslint-plugin-astro] with strict JSX accessibility checks.
- **Base**: Minimal baseline config with no additional presets.
- **Cypress**: Uses [eslint-plugin-cypress] recommended rules for Cypress tests.
- **Jest**: Uses [eslint-plugin-jest]; aligned with the Vitest config for consistency.
- **JSDoc**: Recommended config from [eslint-plugin-jsdoc] for both TypeScript and JavaScript files.
- **JSONC**: Enables key and array sorting in JSON/JSONC documents using [eslint-plugin-jsonc].
- **Node (n)**: Extends the recommended config from [eslint-plugin-n].
- **Perfectionist**: Extends [eslint-plugin-perfectionist]; sorts all the things. Rules in this preset are set to "warn" by default.
- **Promise**: Recommended rules from [eslint-plugin-promise].
- **React**: Combines [@eslint-react/eslint-plugin], [eslint-plugin-react-hooks], [eslint-plugin-react-compiler], and [eslint-plugin-jsx-a11y].
  - **React (type-checked)**: Extends the React preset with [eslint-react]'s strict type-checked config.
- **Regexp**: Recommended rules from [eslint-plugin-regexp].
- **Standard**: Curated default preset (Vitest + core linting presets) for most projects.
- **TOML**: Uses [eslint-plugin-toml] and [toml-eslint-parser] to lint TOML files.
- **TypeScript (ts)**: Sets up TypeScript linting via [typescript-eslint], disabling a few noisy rules; falls back when Nx is unavailable.
  - **TypeScript (type-checked)**: Extends the TypeScript preset with rules that require type information.
  - **TypeScript (type-checked strict)**: Extends the TypeScript preset with stricter rules.
- **Vitest**: Uses [@vitest/eslint-plugin] to keep test files readable.
- **Unicorn**: Recommended rules from [eslint-plugin-unicorn] with customizations.
- **YAML**: Recommended config from [eslint-plugin-yml], plus key and array sorting via [yaml-eslint-parser].

### Conditional configurations

These presets load only when their peer dependencies are present:

- **Nx**: Extends Nx's recommended monorepo config from [@nx/eslint-plugin].

## Utilities

- **getFilePatterns**: Generates glob patterns.
- **setRuleLevel**: Sets the severity of some or all rules in a config or an array of configs.

<!-- Links -->

[@nx/eslint-plugin]: https://nx.dev/docs/technologies/eslint/eslint-plugin/introduction
[@eslint-react/eslint-plugin]: https://eslint-react.xyz
[@vitest/eslint-plugin]: https://github.com/vitest-dev/eslint-plugin-vitest
[eslint-plugin-jest]: https://github.com/jest-community/eslint-plugin-jest
[eslint-plugin-jsdoc]: https://github.com/gajus/eslint-plugin-jsdoc
[eslint-plugin-jsonc]: https://ota-meshi.github.io/eslint-plugin-jsonc
[eslint-plugin-cypress]: https://github.com/cypress-io/eslint-plugin-cypress
[eslint-plugin-react-compiler]: https://www.npmjs.com/package/eslint-plugin-react-compiler
[eslint-plugin-react-hooks]: https://www.npmjs.com/package/eslint-plugin-react-hooks
[eslint-plugin-n]: https://github.com/eslint-community/eslint-plugin-n
[eslint-plugin-perfectionist]: https://perfectionist.dev
[eslint-plugin-promise]: https://github.com/eslint-community/eslint-plugin-promise
[eslint-plugin-regexp]: https://ota-meshi.github.io/eslint-plugin-regexp
[eslint-plugin-toml]: https://ota-meshi.github.io/eslint-plugin-toml
[eslint-plugin-unicorn]: https://github.com/sindresorhus/eslint-plugin-unicorn
[eslint-plugin-yml]: https://ota-meshi.github.io/eslint-plugin-yml
[toml-eslint-parser]: https://ota-meshi.github.io/toml-eslint-parser
[typescript-eslint]: https://typescript-eslint.io
[yaml-eslint-parser]: https://github.com/ota-meshi/yaml-eslint-parser
