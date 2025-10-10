import { ExtendRequired } from '../../lib/type-utils'
import { TSLibrarySchema } from './schema'

export function normalizeOptions(options: TSLibrarySchema): NormalizedSchema {
  return {
    bundler: 'vite',
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
  TSLibrarySchema,
  Exclude<
    keyof TSLibrarySchema,
    'commonjs' | 'directory' | 'force' | 'skipDependencies' | 'skipFormat'
  >
>
