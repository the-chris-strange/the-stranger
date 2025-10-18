/**
 * Common configuration files for [CSpell](https://cspell.org).
 */
export const commitlint = ['commitlint.config.ts'] as const

/**
 * Common configuration files for [CSpell](https://cspell.org).
 */
export const cspell = ['cspell.config.yaml', 'cspell.json'] as const

/**
 * Common configuration files for [Cypress](https://www.cypress.io).
 */
export const cypress = ['cypress.config.ts'] as const

/**
 * Common configuration files for [ESLint](https://eslint.org).
 */
export const eslint = [
  'eslint.config.cjs',
  'eslint.config.js',
  'eslint.config.mjs',
  'eslint.config.ts',
] as const

/**
 * Common configuration files for [Jest](https://jestjs.io).
 */
export const jest = [
  'jest.config.js',
  'jest.config.ts',
  'jest.preset.cjs',
  'jest.preset.js',
  'jest.preset.ts',
] as const

/**
 * Common configuration files for [markdownlint](https://github.co)/DavidAnson/markdownlint].
 */
export const markdownlint = ['.markdownlint-cli2.yaml', '.markdownlintrc'] as const

/**
 * Common configuration files for [Nx](https://nx.dev)
 */
export const nx = ['nx.json', '.nxignore', 'project.json'] as const

/**
 * Common configuration files for [Prettier](https://prettier.io).
 */
export const prettier = [
  'prettier.config.js',
  '.prettierrc',
  '.prettierignore',
] as const

/**
 * Common configuration files for [SST](https://sst.dev).
 */
export const sst = ['sst.config.ts'] as const

/**
 * Common configuration files for [swc](https://swc.rs).
 */
export const swc = ['.swcrc'] as const

/**
 * Common configuration files for [Vite](https://vite.dev).
 */
export const vite = ['vite.config.mts', 'vite.config.ts'] as const

/**
 * Common configuration files for [Vitest](https://vitest.dev).
 */
export const vitest = [
  'vitest.config.mts',
  'vitest.config.ts',
  'vitest.workspace.ts',
  ...vite,
] as const

/**
 * Common configuration files for [Yarn](https://yarnpkg.com).
 */
export const yarn = [
  'yarn.lock',
  'yarn.config.cjs',
  'yarn.config.js',
  '.yarnrc.yml',
] as const

/**
 * Common configuration files for various tools.
 */
export default {
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
}
