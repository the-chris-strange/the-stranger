import { type Config, defineConfig, globalIgnores } from 'eslint/config'

/**
 * Extend the standard base configuration using ESLint's {@link defineConfig} utility.
 * @param configs configuration objects to extend
 * @returns a flat array of standard ESLint configuration objects
 */
export function extendConfig(...configs: InfiniteConfigArray) {
  const base: Config[] = [
    globalIgnores([
      '.cache',
      '.github',
      '.pnp.*',
      '.yarn',
      'coverage',
      'dist',
      'out-tsc',
      'pnpm-lock.yaml',
      'pnpm-workspace.yaml',
      'tmp',
    ]),

    { linterOptions: { reportUnusedDisableDirectives: 'error' } },
  ]

  return defineConfig(...configs.flat(), base) as Config[]
}

export interface ConfigWithExtends extends Config {
  extends?: InfiniteConfigArray
}

export type InfiniteArray<T> = (InfiniteArray<T> | T)[]

export type InfiniteConfigArray = InfiniteArray<ConfigWithExtends>
