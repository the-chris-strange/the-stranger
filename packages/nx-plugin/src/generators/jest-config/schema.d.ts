import { Config } from 'jest'
import { GeneratorSchema } from '../../lib/generator-schema'

/**
 * Schema for the jest configuration file generator.
 */
export interface JestConfigSchema extends GeneratorSchema, JestOptions {
  /**
   * The name of the project in which to generate a jest config.
   */
  project: string
}

type JestOptions = Pick<Config, 'globals' | 'testEnvironment'>
