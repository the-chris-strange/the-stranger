export interface UpdateManifestSchema {
  /**
   * The destination directory to write the updated manifest file.
   * @default dist
   */
  destination?: string
  /**
   * Write the source manifest directly to the destination, overwriting it if it exists.
   */
  force?: boolean
  /**
   * Skip checking for the existence of fields in the source before removing them from the destination.
   */
  skipSourceCheck?: boolean
  /**
   * An array of fields to remove from the destination manifest, or a boolean value indicating whether to remove all fields that aren't set in the source file. The default behavior is to remove any fields that were added by the build process (i.e. those that aren't set in the source manifest).
   * @default true
   */
  unset?: boolean | string[]
}
