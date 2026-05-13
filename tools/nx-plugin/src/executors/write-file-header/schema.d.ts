export interface WriteFileHeaderExecutorSchema {
  /**
   * The paths to files that need headers.
   */
  files: string[]
  /**
   * The content to prepend to the files. If this is an array, each element is added to a new line at the beginning of the file.
   */
  header: string | string[]
}
