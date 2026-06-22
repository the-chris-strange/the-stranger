export interface WorkspaceDependenciesSchema {
  /**
   * The manifest file to write resolved dependency versions to. If not specified, the executor will attempt to find a manifest in the project's build output.
   */
  destination?: string
  /**
   * The prefix to use when writing resolved versions to the destination manifest.
   * @default '^'
   */
  resolvedVersionPrefix?: '' | '^' | '~'
  /**
   * The source manifest file where the workspace dependencies are declared. If not specified, the executor will use the manifest in the project root.
   */
  source?: string
}
