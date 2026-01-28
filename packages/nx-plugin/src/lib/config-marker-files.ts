const vite = ['vite.config.mts', 'vite.config.ts'] as const

/**
 * Common configuration files for various tools.
 */
export default {
  /**
   * Common configuration files for [commitlint](https://commitlint.js.org).
   */
  commitlint: ['commitlint.config.ts'] as const,
  /**
   * Common configuration files for [CSpell](https://cspell.org).
   */
  cspell: ['cspell.config.yaml', 'cspell.json'] as const,
  /**
   * Common configuration files for [Cypress](https://www.cypress.io).
   */
  cypress: ['cypress.config.ts'] as const,
  /**
   * Common configuration files for [ESLint](https://eslint.org).
   */
  eslint: [
    'eslint.config.cjs',
    'eslint.config.js',
    'eslint.config.mjs',
    'eslint.config.ts',
  ] as const,
  /**
   * Common configuration files for [Jest](https://jestjs.io).
   */
  jest: [
    'jest.config.js',
    'jest.config.ts',
    'jest.preset.cjs',
    'jest.preset.js',
    'jest.preset.ts',
  ] as const,
  /**
   * Common configuration files for [markdownlint](https://github.co)/DavidAnson/markdownlint].
   */
  markdownlint: ['.markdownlint-cli2.yaml', '.markdownlintrc'] as const,
  /**
   * Common configuration files for [Nx](https://nx.dev)
   */
  nx: ['nx.json', '.nxignore', 'project.json'] as const,
  /**
   * Common configuration files for [Prettier](https://prettier.io).
   */
  prettier: ['prettier.config.js', '.prettierrc', '.prettierignore'] as const,
  /**
   * Common configuration files for [SST](https://sst.dev).
   */
  sst: ['sst.config.ts'] as const,
  /**
   * Common configuration files for [swc](https://swc.rs).
   */
  swc: ['.swcrc'] as const,
  /**
   * Common configuration files for [Vite](https://vite.dev).
   */
  vite,
  /**
   * Common configuration files for [Vitest](https://vitest.dev).
   */
  vitest: [
    'vitest.config.mts',
    'vitest.config.ts',
    'vitest.workspace.ts',
    ...vite,
  ] as const,
  /**
   * Common configuration files for [Yarn](https://yarnpkg.com).
   */
  yarn: ['yarn.lock', 'yarn.config.cjs', 'yarn.config.js', '.yarnrc.yml'] as const,
}
