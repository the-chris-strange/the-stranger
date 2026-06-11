/**
 * Normalize an array of file extensions and combine them into a comma-separated string.
 * @internal
 * @param extensions file extensions to concatenate
 * @returns the comma-separated string
 */
export function combineExtensions(...extensions: (string | string[])[]) {
  const exts = [...new Set(extensions.flat())].map(stripGlobs)
  if (exts.length === 0) {
    throw new Error('No file extensions provided')
  } else if (exts.length === 1) {
    return exts[0]
  }
  return `{${exts.join(',')}}`
}

/**
 * Expand a file extension into an array of file extensions that match typical Node.js module types.
 * @internal
 * @example
 * expandExtension('js') // -> ['js', 'cjs', 'mjs', 'jsx']
 * @param ext the base file extension
 * @returns an array of file extensions
 */
export function expandExtension(ext: string) {
  ext = stripGlobs(ext)
  return [ext, `c${ext}`, `m${ext}`, `${ext}x`]
}

/**
 * Strip glob patterns from a file extension.
 * @internal
 * @param value the file extension to strip
 * @returns the stripped file extension
 */
function stripGlobs(value: string) {
  return value.replace(/^\./, '').replace(/^[*?]+(?:\/[*?]+\.?)?/, '')
}
