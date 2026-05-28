export interface WorkspaceDependenciesSchema {
  /**
   * The manifest file to write resolved dependency versions to.
   */
  destination?: string
  /**
   * The source manifest file where the workspace dependencies are declared.
   */
  source?: string
}
