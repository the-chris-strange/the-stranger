/**
 * Normalize an array of file extensions and combine them into a comma-separated string.
 * @internal
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
 * @internal
 * @example
 * expandExtension('js') // -> ['js', 'cjs', 'mjs', 'jsx']
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
      case FilePatterns.all: {
        return '**/**'
      }
      case FilePatterns.astro: {
        return sourceFilePattern('astro')
      }
      case FilePatterns.astroScript: {
        return `**/*.astro/${sourceFilePattern('js', 'ts')}`
      }
      case FilePatterns.cjs: {
        return sourceFilePattern('cjs', 'cts')
      }
      case FilePatterns.cypress: {
        return `**/*.cy.${combineExtensions('js', 'ts')}`
      }
      case FilePatterns.esm: {
        return sourceFilePattern('mjs', 'mts')
      }
      case FilePatterns.js: {
        return sourceFilePattern(expandExtension('js'))
      }
      case FilePatterns.react: {
        return sourceFilePattern('js', 'ts', 'jsx', 'tsx')
      }
      case FilePatterns.reactJs: {
        return sourceFilePattern('js', 'jsx')
      }
      case FilePatterns.reactTs: {
        return sourceFilePattern('ts', 'tsx')
      }
      case FilePatterns.source: {
        return sourceFilePattern(expandExtension('js'), expandExtension('ts'), 'astro')
      }
      case FilePatterns.test: {
        return testFilePattern('js', 'jsx', 'ts', 'tsx')
      }
      case FilePatterns.testJs: {
        return testFilePattern('js', 'jsx')
      }
      case FilePatterns.testTs: {
        return testFilePattern('ts', 'tsx')
      }
      case FilePatterns.ts: {
        return sourceFilePattern(expandExtension('ts'))
      }
      default: {
        return sourceFilePattern(pattern)
      }
    }
  })
}

/**
 * Get a glob pattern that recursively matches files with the specified extensions.
 * @internal
 * @param extensions file extensions to match
 * @returns a glob pattern that matches any of the file extensions
 */
export function sourceFilePattern(...extensions: (string | string[])[]) {
  return `**/*.${combineExtensions(...extensions)}`
}

/**
 * Create a glob pattern that recursively matches test files with the specified extensions.
 * @internal
 * @param extensions file extensions to match
 * @returns a glob pattern that matches test files with any of the file extensions
 */
export function testFilePattern(...extensions: (string | string[])[]) {
  return `**/*.{spec,test}.${combineExtensions(...extensions)}`
}

/**
 * Common file patterns used in ESLint configurations.
 */
export enum FilePatterns {
  /**
   * All files ('\*\*\/\*\*').
   */
  all,
  /**
   * Astro-specific files ('.astro').
   */
  astro,
  /**
   * Scripts inside Astro files, which are parsed as virtual files under the virtual "directory" of the '.astro' file.
   */
  astroScript,
  /**
   * CommonJS files ('.cjs' and '.cts').
   */
  cjs,
  /**
   * Cypress E2E & component test files ('.cy.*').
   */
  cypress,
  /**
   * ESM files ('.mjs' and '.mts').
   */
  esm,
  /**
   * JavaScript files.
   */
  js,
  /**
   * JavaScript and TypeScript React files ('.jsx' and '.tsx').
   */
  react,
  /**
   * React JavaScript files ('.jsx').
   */
  reactJs,
  /**
   * React TypeScript files ('.tsx').
   */
  reactTs,
  /**
   * All JavaScript and TypeScript source files.
   */
  source,
  /**
   * All JavaScript and TypeScript test files.
   */
  test,
  /**
   * JavaScript test files.
   */
  testJs,
  /**
   * TypeScript test files.
   */
  testTs,
  /**
   * TypeScript files.
   */
  ts,
}

/**
 * Normalize a file extension by removing leading dot or glob wildcards.
 * @internal
 * @param value the file extension to normalize
 * @returns the normalized file extension
 */
function normalizeExtPattern(value: string) {
  return value.replace(/^\./, '').replace(/^[*?]+(?:\/[*?]+\.?)?/, '')
}
