import { GeneratorSchema } from '../../lib/generator-schema'

/**
 * Options for the Vite/Vitest configuration generator.
 */
export interface ViteConfigSchema extends GeneratorSchema {
  /**
   * The name of the project in which to generate a vite config.
   */
  project: string
  /**
   * Specify a path to write coverage reports, relative to the workspace root. This option is ignored if {@link includeTest} is false.
   * @default '.reports/coverage'
   */
  coveragePath?: string
  /**
   * Allow vitest to inject jest-like API's into the testing environment.
   * @default false
   */
  globals?: boolean
  /**
   * Include build configuration in the generated file.
   * @default true
   */
  includeBuild?: boolean
  /**
   * Include configuration for Vitest in the generated file.
   * @default true
   */
  includeTest?: boolean
  /**
   * Include setup for writing tests directly in source code files, rather than creating separate *.spec files.
   */
  inSourceTests?: boolean
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
   * The testing environment for the project.
   * @default 'node'
   */
  testEnvironment?: 'jsdom' | 'node'
  /**
   * Specify a path to write unit test reports, relative to the workspace root. This option is ignored if {@link includeTest} is false.
   * @default '.reports/tests'
   */
  testReportPath?: string
  /**
   * Set the filename to use in the configuration for `vite-plugin-dts`. If unspecified, the generator will use the project's 'projectType' configuration value to create a file name.
   */
  tsconfigName?: string
}
