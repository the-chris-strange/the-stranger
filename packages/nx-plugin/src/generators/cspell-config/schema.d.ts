import { GeneratorSchema } from '../../lib/generator-schema'

/**
 * CSpell configuration file generator options.
 */
export interface CSpellConfigSchema extends GeneratorSchema {
  /**
   * The name of the project where the cspell config should be generated.
   */
  project: string
}
