# @the-stranger/eslint-plugin

ESLint plugin that provides shared rule presets plus utilities for authoring ESLint config.

## Installation

Requires Node.js 24+ and ESLint 9+.

```bash
npm install --save-dev @the-stranger/eslint-plugin
```

## Optional peer dependencies

Install only the peers you need for the conditional presets:

- `eslint-plugin-jest@^29.12.1`
- `@vitest/eslint-plugin@^1.6.6`
- `eslint-plugin-toml@^0.12.0` and `toml-eslint-parser@^0.10.1`
- `@nx/eslint-plugin@21`

## Usage

In your `eslint.config.js`, extend the presets you want:

```javascript
import le from '@the-stranger/eslint-plugin'
import leJest from '@the-stranger/eslint-plugin/configs/jest'
import leVitest from '@the-stranger/eslint-plugin/configs/vitest'
import leToml from '@the-stranger/eslint-plugin/configs/toml'
import leNx from '@the-stranger/eslint-plugin/configs/nx'
import { objectNamer, setRuleLevel } from '@the-stranger/eslint-plugin/utils'
import { defineConfig } from 'eslint/config'

export default defineConfig({
  extends: [
    // all-in-one
    le.configs.recommended,

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

    // conditional presets when peers are installed
    leJest,
    leVitest,
    leToml,
    leNx,

    // customization helpers
    setRuleLevel('error', le.configs.perfectionist),
    objectNamer(le.configs.ts, 'my-eslint-config'),
  ],
})
```

## Configurations

- **JSDoc**: Recommended config from [eslint-plugin-jsdoc] for both TypeScript and JavaScript files; allows the `@document` tag used by Docusaurus.
- **JSONC**: Enables key and array sorting in JSON/JSONC documents using [eslint-plugin-jsonc].
- **Node (n)**: Extends the recommended config from [eslint-plugin-n].
- **Perfectionist**: Extends [eslint-plugin-perfectionist]; sorts all the things.
- **Promise**: Recommended rules from [eslint-plugin-promise].
- **Regexp**: Recommended rules from [eslint-plugin-regexp].
- **TypeScript (ts)**: Sets up TypeScript linting via [typescript-eslint], disabling a few noisy rules; falls back when Nx is unavailable.
- **Unicorn**: Recommended rules from [eslint-plugin-unicorn] with customizations.
- **YAML**: Recommended config from [eslint-plugin-yml], plus key and array sorting via [yaml-eslint-parser].

### Conditional configurations

These presets load only when their peer dependencies are present:

- **Jest**: Uses [eslint-plugin-jest]; aligned with the Vitest rules for consistency.
- **Vitest**: Uses [@vitest/eslint-plugin] to keep test files readable.
- **TOML**: Uses [eslint-plugin-toml] and [toml-eslint-parser] to lint TOML files.
- **Nx**: Extends Nx's recommended monorepo config from [@nx/eslint-plugin].

## Utilities

- **getFilePatterns**: Generates glob patterns.
- **namer**: Simple helper for naming config blocks.
- **objectNamer**: Wraps a config object and assigns it a friendly name for reports.
- **setRuleLevel**: Sets the severity of some or all rules in a config, handling nested configs.

<!-- Links -->

[@nx/eslint-plugin]: https://nx.dev/docs/technologies/eslint/eslint-plugin/introduction
[@vitest/eslint-plugin]: https://github.com/vitest-dev/eslint-plugin-vitest
[eslint-plugin-jest]: https://github.com/jest-community/eslint-plugin-jest
[eslint-plugin-jsdoc]: https://github.com/gajus/eslint-plugin-jsdoc
[eslint-plugin-jsonc]: https://ota-meshi.github.io/eslint-plugin-jsonc
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
