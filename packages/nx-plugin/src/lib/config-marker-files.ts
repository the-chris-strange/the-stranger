const viteMarkers = ['vite.config.mts', 'vite.config.ts'] as const

/**
 * Common configuration files for various tools.
 */
export const markerFiles = {
  /**
   * Common configuration files for [commitlint](https://commitlint.js.org).
   */
  commitlint: ['commitlint.config.ts'],
  /**
   * Common configuration files for [CSpell](https://cspell.org).
   */
  cspell: ['cspell.config.yaml', 'cspell.json'],
  /**
   * Common configuration files for [Cypress](https://www.cypress.io).
   */
  cypress: ['cypress.config.ts'],
  /**
   * Common configuration files for [ESLint](https://eslint.org).
   */
  eslint: [
    'eslint.config.cjs',
    'eslint.config.js',
    'eslint.config.mjs',
    'eslint.config.ts',
  ],
  /**
   * Common configuration files for [Jest](https://jestjs.io).
   */
  jest: [
    'jest.config.js',
    'jest.config.ts',
    'jest.preset.cjs',
    'jest.preset.js',
    'jest.preset.ts',
  ],
  /**
   * Common configuration files for [markdownlint](https://github.co)/DavidAnson/markdownlint].
   */
  markdownlint: ['.markdownlint-cli2.yaml', '.markdownlintrc'],
  /**
   * Common configuration files for [Nx](https://nx.dev)
   */
  nx: ['nx.json', '.nxignore', 'project.json'],
  /**
   * Common configuration files for [Prettier](https://prettier.io).
   */
  prettier: ['prettier.config.js', '.prettierrc', '.prettierignore'],
  /**
   * Common configuration files for [SST](https://sst.dev).
   */
  sst: ['sst.config.ts'],
  /**
   * Common configuration files for [swc](https://swc.rs).
   */
  swc: ['.swcrc'],
  /**
   * Common configuration files for [Vite](https://vite.dev).
   */
  vite: viteMarkers,
  /**
   * Common configuration files for [Vitest](https://vitest.dev).
   */
  vitest: [
    'vitest.config.mts',
    'vitest.config.ts',
    'vitest.workspace.ts',
    ...viteMarkers,
  ],
  /**
   * Common configuration files for [Yarn](https://yarnpkg.com).
   */
  yarn: ['yarn.lock', 'yarn.config.cjs', 'yarn.config.js', '.yarnrc.yml'],
} as const

export const {
  cspell,
  cypress,
  eslint,
  jest,
  markdownlint,
  nx,
  prettier,
  sst,
  swc,
  vite,
  vitest,
  yarn,
} = markerFiles

export default markerFiles
