import type { LibraryFormats } from 'vite'

import type { GeneratorSchema } from '../../lib/generator-schema'

/**
 * Options for the Vite configuration generator.
 */
export interface ViteConfigSchema extends GeneratorSchema {
  /**
   * The name of the project in which to generate a vite config.
   */
  project: string
  /**
   * The file extension to use for the generated vite config.
   * @default 'mts'
   */
  ext?: 'mts' | 'ts'
  /**
   * Module formats produced by the build process.
   * @default ['es']
   */
  formats?: LibraryFormats[]
  /**
   * Indicate that the project uses React.js.
   * @default false
   */
  react?: boolean
  /**
   * An array of values to add to the `rollupExternals` configuration field.
   */
  rollupExternals?: string[]
  /**
   * Skip updating the project's tsconfig.json files.
   */
  skipTsconfigs?: boolean
  /**
   * Use the SWC compiler instead of babel.
   */
  swc?: boolean
  /**
   * Build targets.
   */
  target?: string[]
  /**
   * Indicates whether the project uses workers.
   * @default false
   */
  worker?: boolean
}
