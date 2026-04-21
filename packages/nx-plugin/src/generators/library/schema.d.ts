import type { LibraryGeneratorSchema } from '@nx/js/src/generators/library/schema'

import type { GeneratorSchema } from '../../lib/generator-schema'
import type { ViteConfigSchema } from '../vite-config/schema'

export interface LibrarySchema extends GeneratorSchema, NxLibOptions, ViteOptions {
  /**
   * The name of the new library.
   */
  name: string
  /**
   * By default, this generator produces an ES module. Set this to produce a commonjs library instead.
   */
  commonjs?: boolean
  /**
   * The root directory of the project.
   */
  directory?: string
  /**
   * Skip creating a CSpell configuration file for the project.
   */
  skipCspell?: boolean
  /**
   * Skip creating an ESLint configuration file for the project.
   */
  skipEslint?: boolean
  /**
   * Skip creating a Jest or Vitest configuration file for the project.
   */
  skipTestConfig?: boolean
}

type NxLibOptions = Pick<
  LibraryGeneratorSchema,
  'bundler' | 'testEnvironment' | 'unitTestRunner'
>

type ViteOptions = Pick<
  ViteConfigSchema,
  'globals' | 'react' | 'rollupExternals' | 'swc'
>
