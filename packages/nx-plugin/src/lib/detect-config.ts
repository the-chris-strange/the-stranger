import { joinPathFragments, Tree } from '@nx/devkit'

import { findExisting } from './find-existing'

/**
 * Detect whether a project uses a library or tool by looking for specific config files.
 * @param tree the NX virtual file system
 * @param config the type of configuration to detect
 * @param prefix the path prefix for the configuration file
 * @returns true if the configuration file exists
 */
export function detectConfig(tree: Tree, config: ConfigTypes, prefix?: string) {
  const markerFiles = MARKER_FILES[config].map(e =>
    prefix ? joinPathFragments(prefix, e) : e,
  )
  return findExisting(tree, ...markerFiles) !== undefined
}

export const MARKER_FILES = {
  cspell: ['cspell.config.yaml', 'cspell.json'],
  eslint: [
    'eslint.config.cjs',
    'eslint.config.js',
    'eslint.config.mjs',
    'eslint.config.ts',
  ],
  jest: [
    'jest.config.js',
    'jest.config.ts',
    'jest.preset.cjs',
    'jest.preset.js',
    'jest.preset.ts',
  ],
  vite: ['vite.config.mts', 'vite.config.ts'],
  vitest: ['vitest.config.mts', 'vitest.config.ts', 'vitest.workspace.ts'],
}

MARKER_FILES.vitest.push(...MARKER_FILES.vite)

export type ConfigTypes = keyof typeof MARKER_FILES
