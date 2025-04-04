/**
 * Base schema for generators in this nx plugin.
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
