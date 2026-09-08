export interface ReleaseExecutorSchema {
  /** Preview the resolved versions without changing files or publishing. */
  dryRun?: boolean
  /** Treat the release as the first release for the selected projects. */
  firstRelease?: boolean
  /** Release only these release groups. */
  groups?: string[]
  /** Prerelease identifier, such as `next` or `beta`. */
  preid?: string
  /** Release only these projects. */
  projects?: string[]
  /** Explicit semver version or relative bump, such as `patch`. */
  specifier?: string
  /** Print additional Nx Release output. */
  verbose?: boolean
}
