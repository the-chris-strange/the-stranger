import type { GeneratorSchema } from '../../lib/generator-schema'
import type { ViteConfigSchema } from '../vite-config/schema'
import type { VitestConfigSchema } from '../vitest-config/schema'

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

// Keep public options independent of version-specific Nx internal entrypoints.
interface NxLibOptions {
  bundler?: 'esbuild' | 'none' | 'rollup' | 'swc' | 'tsc' | 'vite'
  testEnvironment?: 'jsdom' | 'node'
  unitTestRunner?: 'jest' | 'none' | 'vitest'
}

type ViteOptions = Pick<ViteConfigSchema, 'react' | 'rollupExternals' | 'swc'> &
  Pick<VitestConfigSchema, 'globals'>
