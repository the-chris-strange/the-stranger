export interface SyncManifestSchema {
  manifest?: string
  /**
   * A list of fields to synchronize from the root package.json to the project package.json. Fields will be created if they do not already exist in the project manifest. Use dot notation to specify nested fields, e.g. `author.name`. Bracket notation is also supported, e.g. `author['name']` or `items[0].name`.
   */
  syncFields?: string[]
}
