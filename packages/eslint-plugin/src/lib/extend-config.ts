import { defineConfig, globalIgnores } from 'eslint/config'

import { namer } from './namer.js'

/**
 * Extend the standard base configuration using ESLint's {@link defineConfig} utility.
 * @param configs configuration objects to extend
 * @returns a flat array of standard ESLint configuration objects
 */
export function extendConfig(...configs: InfiniteConfigArray[]) {
  const base: ConfigWithExtends[] = [
    globalIgnores(
      [
        '.cache',
        '.github',
        '.nx',
        '.pnp.*',
        '.yarn',
        'coverage',
        'dist',
        'out-tsc',
        'pnpm-lock.yaml',
        'pnpm-workspace.yaml',
        'tmp',
      ],
      namer('global ignores'),
    ),

    { linterOptions: { reportUnusedDisableDirectives: 'error' } },
  ]

  return defineConfig(...configs, ...base)
}

export type ConfigWithExtends = Exclude<InfiniteConfigArray, any[]>

export type InfiniteConfigArray = Parameters<typeof defineConfig>[0]
