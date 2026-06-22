import type { ExtendRequired } from '../../lib/type-utils'
import type { LibrarySchema } from './schema'

export function normalizeOptions(options: LibrarySchema): NormalizedSchema {
  return {
    bundler: 'tsc',
    globals: false,
    project: options.name,
    react: false,
    rollupExternals: [],
    skipCspell: false,
    skipEslint: false,
    skipTestConfig: false,
    swc: false,
    testEnvironment: 'node',
    unitTestRunner: 'vitest',
    ...options,
  }
}

export interface NormalizedSchema extends StrictTSLibrarySchema {
  project: string
}

type StrictTSLibrarySchema = ExtendRequired<
  LibrarySchema,
  Exclude<
    keyof LibrarySchema,
    'commonjs' | 'directory' | 'dryRun' | 'force' | 'skipDependencies' | 'skipFormat'
  >
>
