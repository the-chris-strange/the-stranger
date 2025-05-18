/**
 * Ensure that the glob patterns provided start with `**`, so they apply to all nested files.
 * @param patterns the patterns to globbify
 * @returns the array of recursive glob patterns
 */
export function filePatterns(...patterns: string[]) {
  const pattern = '**/'
  return patterns.map(e => (e.startsWith(pattern) ? e : `${pattern}${e}`))
}

/**
 * Array of file patterns matching JavaScript (but not TypeScript) files.
 * @example *.js, *.mjs
 */
export const JS_FILES = filePatterns('*.js', '*.jsx', '*.mjs', '*.cjs')

/**
 * Array of file patterns matching TypeScript (but not JavaScript) files.
 * @example *.ts, *.tsx
 */
export const TS_FILES = filePatterns('*.ts', '*.tsx', '*.mts', '*.cts')

/**
 * Array of file patterns matching test files.
 * @example *.spec.ts, *.test.jsx
 */
export const TEST_FILES = filePatterns(
  '*.spec.ts',
  '*.spec.tsx',
  '*.spec.js',
  '*.spec.jsx',
  '*.test.ts',
  '*.test.tsx',
  '*.test.js',
  '*.test.jsx',
)

/**
 * Array of file patterns matching all source files (but not test files).
 */
export const SOURCE_FILES = [...JS_FILES, ...TS_FILES]
