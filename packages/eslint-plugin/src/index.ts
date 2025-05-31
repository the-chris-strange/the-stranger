import { config } from './lib/config'
import { cypressConfig } from './lib/configs/cypress'
import jsdoc from './lib/configs/jsdoc'
import n from './lib/configs/n'
import { nxConfig, nxDependencyChecksConfig } from './lib/configs/nx'
import perfectionist from './lib/configs/perfectionist'
import promise from './lib/configs/promise'
import re from './lib/configs/regexp'
import { tomlConfig } from './lib/configs/toml'
import ts from './lib/configs/typescript-eslint'
import unicorn from './lib/configs/unicorn'
import { vitestConfig } from './lib/configs/vitest'
import { yamlConfig } from './lib/configs/yml'
import { meta } from './lib/meta'

export { config } from './lib/config'
export { meta } from './lib/meta'

const vitest = await config(vitestConfig)
const testFiles = await config(vitest) // todo: add jest config also
const base = await config(
  {
    ignores: [
      '.cache',
      '.github',
      '.nx',
      '.pnp.*',
      '.yarn',
      'coverage',
      'dist',
      'node_modules',
      'tmp',
    ],
  },

  { linterOptions: { reportUnusedDisableDirectives: 'error' } },

  perfectionist,
  unicorn,
  ts,
  jsdoc,
)
const recommended = await config(base, testFiles, promise, n, re)
const nx = await config(nxConfig)
const toml = await config(tomlConfig)
const yml = await config(yamlConfig)

/**
 * Shared configurations for the various plugins included in this package. If the required peer dependencies for a plugin are not installed, the configuration is not included in the final ESLint configuration.
 */
export const configs = {
  /**
   * The base ESLint configuration, which includes the default ignored files as well as standard configurations for the following plugins:
   * - eslint-plugin-perfectionist
   * - eslint-plugin-unicorn
   * - typescript-eslint
   * - eslint-plugin-jsdoc
   */
  base,
  /**
   * Standard configuration for [eslint-plugin-cypress](https://github.com/cypress-io/eslint-plugin-cypress#readme).
   */
  'cypress': await config(cypressConfig),
  /**
   * Standard configuration for [eslint-plugin-jsdoc](https://github.com/gajus/eslint-plugin-jsdoc#readme).
   */
  jsdoc,
  /**
   * Standard configuration for [eslint-plugin-n](https://github.com/eslint-community/eslint-plugin-n#readme).
   */
  n,
  /**
   * Standard configuration for [@nx/eslint-plugin](https://nx.dev/nx-api/eslint-plugin/documents/overview).
   */
  nx,
  /**
   * The recommended nx/dependency-checks configuration for projects in an Nx workspace.
   */
  'nx/dependency-checks': await config(nxDependencyChecksConfig),
  /**
   * Standard configuration for [eslint-plugin-perfectionist](https://perfectionist.dev).
   */
  perfectionist,
  /**
   * Standard configuration for [eslint-plugin-promise](https://github.com/eslint-community/eslint-plugin-promise?tab=readme-ov-file#readme).
   */
  promise,
  /**
   * Recommended configuration, which includes the {@link configs.base} configuration as well as standard configurations for the following plugins:
   * - eslint-plugin-n
   * - eslint-plugin-promise
   * - eslint-plugin-regexp
   */
  recommended,
  /**
   * Recommended configurations for `@vitest/eslint-plugin` and/or `eslint-plugin-jest`.
   */
  'recommended/tests': testFiles,
  /**
   * Standard configuration for [eslint-plugin-regexp](https://github.com/ota-meshi/eslint-plugin-regexp#readme).
   */
  'regexp': re,
  /**
   * Standard configuration for [eslint-plugin-toml](https://ota-meshi.github.io/eslint-plugin-toml/).
   */
  toml,
  /**
   * Standard configuration for [typescript-eslint](https://typescript-eslint.io/).
   */
  ts,
  /**
   * Standard configuration for [eslint-plugin-unicorn](https://github.com/sindresorhus/eslint-plugin-unicorn#readme).
   */
  unicorn,
  /**
   * Standard configuration for [@vitest/eslint-plugin](https://github.com/vitest-dev/eslint-plugin-vitest#readme).
   */
  vitest,
  /**
   * Standard configuration for [eslint-plugin-yml](https://ota-meshi.github.io/eslint-plugin-yml/).
   */
  yml,
}

export default { configs, meta }
