import type { Options } from '@the-stranger/eslint-config'
import type { GeneratorSchema } from '@the-stranger/nx-plugin'

export interface EslintConfigSchema extends GeneratorSchema {
  /**
   * JavaScript expressions to append as additional `configure()` arguments after the generated workspace defaults.
   */
  additionalConfigs?: (object | string)[]
  /**
   * Options to pass as the first argument to `configure()`.
   */
  configureOptions?: Options
  /**
   * Specify a configuration file to extend. If unspecified, the configuration file at the root of the workspace is used.
   */
  extend?: string
  /**
   * The name of the project in which to generate an eslint config.
   */
  project?: string
}
