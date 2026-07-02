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
   * Module formats produced by the build process. This option is ignored if {@link includeBuild} is false.
   * @default ['es']
   */
  formats?: LibraryFormats[]
  /**
   * Include build configuration in the generated file.
   */
  includeBuild?: boolean
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
   * Build targets. This options is ignored if {@link includeBuild} is false.
   */
  target?: string[]
  /**
   * Set the filename to use in the configuration for `vite-plugin-dts`. If unspecified, the generator will use the project's 'projectType' configuration value to create a file name.
   */
  tsconfigName?: string
  /**
   * Indicates whether the project uses workers.
   * @default false
   */
  worker?: boolean
}
