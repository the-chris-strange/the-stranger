import { GeneratorSchema } from '../../lib/generator-schema'

/**
 * Schema for the cspell configuration file generator.
 */
export interface CspellConfigSchema extends GeneratorSchema {
  /**
   * The name of the project where the cspell config should be generated.
   */
  project: string
  /**
   * Overwrite existing files.
   * @default false
   */
  force?: boolean
}
