import { combineExtensions, expandExtension } from './extensions.js'
import { createRecursivePattern, createRecursiveTestPattern } from './globs.js'

/**
 * Convenient function to generate some common glob patterns.
 * @param patterns an array of file patterns or file extensions
 * @returns a glob pattern that matches the indicated file(s)
 */
export function getFilePatterns(...patterns: (string | FilePatterns)[]): string[] {
  return patterns.flatMap(pattern => {
    switch (pattern) {
      case FilePatterns.all: {
        return '**/**'
      }
      case FilePatterns.astro: {
        return getFilePatterns(FilePatterns.astroModules, FilePatterns.astroScript)
      }
      case FilePatterns.astroModules: {
        return createRecursivePattern('astro')
      }
      case FilePatterns.astroScript: {
        return `**/*.astro/${createRecursivePattern('js', 'ts')}`
      }
      case FilePatterns.cjs: {
        return createRecursivePattern('cjs', 'cts')
      }
      case FilePatterns.cypress: {
        return `**/*.cy.${combineExtensions('js', 'ts')}`
      }
      case FilePatterns.esm: {
        return createRecursivePattern('mjs', 'mts')
      }
      case FilePatterns.js: {
        return createRecursivePattern(expandExtension('js'))
      }
      case FilePatterns.react: {
        return createRecursivePattern('js', 'ts', 'jsx', 'tsx')
      }
      case FilePatterns.reactJs: {
        return createRecursivePattern('js', 'jsx')
      }
      case FilePatterns.reactTs: {
        return createRecursivePattern('ts', 'tsx')
      }
      case FilePatterns.source: {
        return createRecursivePattern(
          expandExtension('js'),
          expandExtension('ts'),
          'astro',
        )
      }
      case FilePatterns.test: {
        return createRecursiveTestPattern('js', 'jsx', 'ts', 'tsx')
      }
      case FilePatterns.testJs: {
        return createRecursiveTestPattern('js', 'jsx')
      }
      case FilePatterns.testTs: {
        return createRecursiveTestPattern('ts', 'tsx')
      }
      case FilePatterns.ts: {
        return createRecursivePattern(expandExtension('ts'))
      }
      default: {
        return /^[a-z]+$/i.test(pattern) ? createRecursivePattern(pattern) : pattern
      }
    }
  })
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
   * All Astro-related files ('.astro' and scripts inside '.astro' files).
   */
  astro,
  /**
   * Astro (.astro) files.
   */
  astroModules,
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
