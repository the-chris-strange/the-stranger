/**
 * Error thrown when a file cannot be found at the specified path.
 * ```typescript
 * throw new FileNotFoundError('/path/to/missing/file.ts');
 * ```
 */
export class FileNotFoundError extends Error {
  constructor(filepath: string) {
    super(`No file found at '${filepath}'`)
    this.name = 'FileNotFoundError'
  }
}
