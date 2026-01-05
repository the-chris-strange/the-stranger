export class FileNotFoundError extends Error {
  constructor(filepath: string) {
    super(`No file found at '${filepath}'`)
    this.name = 'FileNotFoundError'
  }
}
