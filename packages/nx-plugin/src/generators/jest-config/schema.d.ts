import { GeneratorSchema } from '../../lib/generator-schema'

/**
 * Schema for the jest configuration file generator.
 */
export interface JestConfigSchema extends GeneratorSchema {
  /**
   * The name of the project in which to generate a jest config.
   */
  project: string
  /**
   * Allow jest to inject its API's into the testing environment.
   * @default false
   */
  globals?: boolean
  /**
   * The testing environment for the project.
   * @default node
   */
  testEnvironment?: 'jsdom' | 'node'
}
