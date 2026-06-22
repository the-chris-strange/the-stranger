import type { Config } from 'jest'

import type { GeneratorSchema } from '../../lib/generator-schema'

/**
 * Schema for the jest configuration file generator.
 */
export interface JestConfigSchema extends GeneratorSchema, JestOptions {
  /**
   * The name of the project in which to generate a jest config.
   */
  project: string
  /**
   * Inject the Jest API into the global environment.
   */
  globals?: Config['injectGlobals']
}

type JestOptions = Pick<Config, 'testEnvironment'>
