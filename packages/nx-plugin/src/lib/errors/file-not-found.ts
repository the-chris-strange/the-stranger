/**
 * Error thrown when a file cannot be found at the specified path.
 * @example
 * throw new FileNotFoundError('/path/to/missing/file.ts')
 */
export class FileNotFoundError extends Error {
  /**
   * Construct a new FileNotFoundError.
   * @param filepath the path that doesn't exist
   * @param message override the default error message
   */
  constructor(
    public filepath: string,
    message?: string,
  ) {
    super(message ?? `No file found at '${filepath}'`)
    this.name = 'FileNotFoundError'
  }
}
