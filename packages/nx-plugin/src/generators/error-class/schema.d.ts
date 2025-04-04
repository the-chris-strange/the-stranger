import { GeneratorSchema } from '../../lib/generator-schema'

/**
 * Schema for the custom error class generator.
 */
export interface ErrorClassSchema extends GeneratorSchema {
  /**
   * The directory where the new file should be generated.
   */
  directory: string
  /**
   * The name of the new custom Error.
   */
  name: string
  /**
   * Override the default description of the error in the generated jsdoc comment.
   */
  description?: string
  /**
   * Specify an Error class to extend.
   * @default Error
   */
  extend?: string
  /**
   * Do not create a test file.
   */
  skipTests?: boolean
}
