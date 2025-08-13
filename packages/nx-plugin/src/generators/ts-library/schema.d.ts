import { LibraryGeneratorSchema } from '@nx/js/src/generators/library/schema'

import { GeneratorSchema } from '../../lib/generator-schema'
import { ViteConfigSchema } from '../vite-config/schema'

export interface TSLibrarySchema extends ExternalOptions {
  /**
   * The name of the new library.
   */
  name: string
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

type ExternalOptions = GeneratorSchema & NxLibOptions & ViteOptions

type NxLibOptions = Pick<
  LibraryGeneratorSchema,
  'bundler' | 'testEnvironment' | 'unitTestRunner'
>

type ViteOptions = Pick<
  ViteConfigSchema,
  'globals' | 'react' | 'rollupExternals' | 'swc'
>
