import { describe, expect, it } from 'vitest'

import {
  combineExtensions,
  expandExtension,
  FilePatterns,
  getFilePatterns,
  sourceFilePattern,
  testFilePattern,
} from './patterns.js'

describe('combineExtensions', () => {
  it('throws if no extensions are provided', () => {
    expect(() => combineExtensions()).toThrow('No file extensions provided')
  })
})

describe('expandExtension', () => {
  it.each([
    ['js', ['js', 'cjs', 'mjs', 'jsx']],
    ['ts', ['ts', 'cts', 'mts', 'tsx']],
  ])('returns the expected extensions for "%s" files', (ext, expected) => {
    expect(expandExtension(ext)).toMatchObject(expected)
  })

  it('normalizes input value', () => {
    expect(expandExtension('.js')).not.toContain('.js')
  })
})

describe('sourceFilePattern', () => {
  it('flattens nested arrays from input', () => {
    expect(sourceFilePattern('js', ['jsx', 'cjs'])).toBe('**/*.{js,jsx,cjs}')
  })

  it('normalizes input values', () => {
    expect(sourceFilePattern('.js', ['.ts'])).toBe('**/*.{js,ts}')
  })
})

describe('testFilePattern', () => {
  it('flattens nested arrays from input', () => {
    expect(testFilePattern('js', ['jsx', 'cjs'])).toBe('**/*.{spec,test}.{js,jsx,cjs}')
  })

  it('normalizes input values', () => {
    expect(testFilePattern('.js', ['.ts'])).toBe('**/*.{spec,test}.{js,ts}')
  })
})

describe('getFilePatterns', () => {
  const testCases: [string, FilePatterns, string[]][] = [
    ['FilePatterns.all', FilePatterns.all, ['**/**']],
    ['FilePatterns.astro', FilePatterns.astro, ['**/*.astro']],
    ['FilePatterns.astroScript', FilePatterns.astroScript, ['**/*.astro/**/*.{js,ts}']],
    ['FilePatterns.cjs', FilePatterns.cjs, ['**/*.{cjs,cts}']],
    ['FilePatterns.cypress', FilePatterns.cypress, ['**/*.cy.{js,ts}']],
    ['FilePatterns.esm', FilePatterns.esm, ['**/*.{mjs,mts}']],
    ['FilePatterns.js', FilePatterns.js, ['**/*.{js,cjs,mjs,jsx}']],
    ['FilePatterns.testJs', FilePatterns.testJs, ['**/*.{spec,test}.{js,jsx}']],
    ['FilePatterns.react', FilePatterns.react, ['**/*.{js,ts,jsx,tsx}']],
    ['FilePatterns.reactJs', FilePatterns.reactJs, ['**/*.{js,jsx}']],
    ['FilePatterns.reactTs', FilePatterns.reactTs, ['**/*.{ts,tsx}']],
    [
      'FilePatterns.source',
      FilePatterns.source,
      ['**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx,astro}'],
    ],
    ['FilePatterns.test', FilePatterns.test, ['**/*.{spec,test}.{js,jsx,ts,tsx}']],
    ['FilePatterns.ts', FilePatterns.ts, ['**/*.{ts,cts,mts,tsx}']],
    ['FilePatterns.testTs', FilePatterns.testTs, ['**/*.{spec,test}.{ts,tsx}']],
  ]
  it.each(testCases)(
    'returns the expected patterns for "%s"',
    (_, pattern, expected) => {
      expect(getFilePatterns(pattern)).toMatchObject(expected)
    },
  )

  it('returns additional patterns', () => {
    expect(getFilePatterns('js', 'ts', 'toml')).toMatchObject([
      '**/*.js',
      '**/*.ts',
      '**/*.toml',
    ])
  })
})
