import { describe, expect, it } from 'vitest'

import {
  combineExtensions,
  expandExtension,
  FilePatterns,
  getFilePatterns,
  sourceFilePattern,
  testFilePattern,
} from './patterns'

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
  const testCases: [FilePatterns, string[]][] = [
    [FilePatterns.js, ['**/*.{js,cjs,mjs,jsx}']],
    [FilePatterns.ts, ['**/*.{ts,cts,mts,tsx}']],
    [FilePatterns.jsTest, ['**/*.{spec,test}.{js,jsx}']],
    [FilePatterns.tsTest, ['**/*.{spec,test}.{ts,tsx}']],
    [FilePatterns.source, ['**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}']],
    [FilePatterns.test, ['**/*.{spec,test}.{js,jsx,ts,tsx}']],
    [FilePatterns.cjs, ['**/*.{cjs,cts}']],
    [FilePatterns.esm, ['**/*.{mjs,mts}']],
    [FilePatterns.react, ['**/*.{jsx,tsx}']],
  ]
  it.each(testCases)('returns the expected patterns for "%s"', (pattern, expected) => {
    expect(getFilePatterns(pattern)).toMatchObject(expected)
  })

  it('returns additional patterns', () => {
    expect(getFilePatterns('js', 'ts', 'toml')).toMatchObject([
      '**/*.js',
      '**/*.ts',
      '**/*.toml',
    ])
  })
})
