/**
 * Normalize an array of file extensions and combine them into a comma-separated string.
 * @param extensions file extensions to concatenate
 * @returns the comma-separated string
 */
export function combineExtensions(...extensions: (string | string[])[]) {
  const exts = [...new Set(extensions.flat())].map(normalizeExtPattern)
  if (exts.length === 0) {
    throw new Error('No file extensions provided')
  } else if (exts.length === 1) {
    return exts[0]
  }
  return `{${exts.join(',')}}`
}

/**
 * Expand a file extension into an array of file extensions that match typical Node.js module types.
 * @example
 * expandExtension('js') // ['js', 'cjs', 'mjs', 'jsx']
 * @param ext the base file extension
 * @returns an array of file extensions
 */
export function expandExtension(ext: string) {
  ext = normalizeExtPattern(ext)
  return [ext, `c${ext}`, `m${ext}`, `${ext}x`]
}

/**
 * Convenient function to generate some common glob patterns.
 * @param patterns an array of file patterns or file extensions
 * @returns a glob pattern that matches the indicated file(s)
 */
export function getFilePatterns(...patterns: (string | FilePatterns)[]) {
  return patterns.map(pattern => {
    switch (pattern) {
      case FilePatterns.cjs: {
        return sourceFilePattern('cjs', 'cts')
      }
      case FilePatterns.esm: {
        return sourceFilePattern('mjs', 'mts')
      }
      case FilePatterns.js: {
        return sourceFilePattern(expandExtension('js'))
      }
      case FilePatterns.jsTest: {
        return testFilePattern('js', 'jsx')
      }
      case FilePatterns.react: {
        return sourceFilePattern('jsx', 'tsx')
      }
      case FilePatterns.source: {
        return sourceFilePattern(expandExtension('js'), expandExtension('ts'))
      }
      case FilePatterns.test: {
        return testFilePattern('js', 'jsx', 'ts', 'tsx')
      }
      case FilePatterns.ts: {
        return sourceFilePattern(expandExtension('ts'))
      }
      case FilePatterns.tsTest: {
        return testFilePattern('ts', 'tsx')
      }
      default: {
        return sourceFilePattern(pattern)
      }
    }
  })
}

/**
 * Convenient function to generate some common glob patterns.
 * @param fileType the type of file pattern to generate
 * @returns a glob pattern that matches the indicated file type
 */
export function getPattern(fileType: FilePattern) {
  switch (fileType) {
    case 'js-source-files': {
      return sourceFilePattern(expandExtension('js'))
    }
    case 'js-test-files': {
      return testFilePattern('js', 'jsx')
    }
    case 'source-files': {
      return sourceFilePattern(expandExtension('js'), expandExtension('ts'))
    }
    case 'test-files': {
      return testFilePattern('js', 'jsx', 'ts', 'tsx')
    }
    case 'ts-source-files': {
      return sourceFilePattern(expandExtension('ts'))
    }
    case 'ts-test-files': {
      return testFilePattern('ts', 'tsx')
    }
    default: {
      return sourceFilePattern(fileType.replace(/-files$/, ''))
    }
  }
}

/**
 * Normalize a file extension by removing leading dot or glob wildcards.
 * @param value the file extension to normalize
 * @returns the normalized file extension
 */
export function normalizeExtPattern(value: string) {
  return value.replace(/^\./, '').replace(/^[*?]+(\/[*?]+\.?)?/, '')
}

/**
 * Get a glob pattern that recursively matches files with the specified extensions.
 * @param extensions file extensions to match
 * @returns a glob pattern that matches any of the file extensions
 */
export function sourceFilePattern(...extensions: (string | string[])[]) {
  return `**/*.${combineExtensions(...extensions)}`
}

/**
 * Create a glob pattern that recursively matches test files with the specified extensions.
 * @param extensions file extensions to match
 * @returns a glob pattern that matches test files with any of the file extensions
 */
export function testFilePattern(...extensions: (string | string[])[]) {
  return `**/*.{spec,test}.${combineExtensions(...extensions)}`
}

export enum FilePatterns {
  /**
   * CommonJS files ('.cjs' and '.cts').
   */
  cjs = 'cjs-files',
  /**
   * ESM files ('.mjs' and '.mts').
   */
  esm = 'esm-files',
  /**
   * JavaScript files.
   */
  js = 'js-files',
  /**
   * JavaScript test files.
   */
  jsTest = 'js-test-files',
  /**
   * React files ('.jsx' and '.tsx').
   */
  react = 'react-files',
  /**
   * All JavaScript and TypeScript source files.
   */
  source = 'source-files',
  /**
   * All JavaScript and TypeScript test files.
   */
  test = 'test-files',
  /**
   * TypeScript files.
   */
  ts = 'ts-files',
  /**
   * TypeScript test files.
   */
  tsTest = 'ts-test-files',
}

export type FilePattern =
  | 'cjs-files'
  | 'cts-files'
  | 'js-files'
  | 'js-source-files'
  | 'js-test-files'
  | 'jsx-files'
  | 'mjs-files'
  | 'mts-files'
  | 'source-files'
  | 'test-files'
  | 'ts-files'
  | 'ts-source-files'
  | 'ts-test-files'
  | 'tsx-files'
