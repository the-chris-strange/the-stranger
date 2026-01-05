/**
 * Configuration options common to all generators in this plugin.
 */
export interface GeneratorSchema {
  /**
   * Overwrite existing files.
   */
  force?: boolean
  /**
   * Skip installing dependencies to the project.
   * @internal
   */
  skipDependencies?: boolean
  /**
   * Skip formatting file.
   * @internal
   */
  skipFormat?: boolean
}
