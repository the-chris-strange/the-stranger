import { describe, expect, it } from 'vitest'

import { FilePatterns, getFilePatterns } from './patterns.js'

describe('getFilePatterns', () => {
  const testCases = [
    ['all', FilePatterns.all, ['**/**']],
    ['astro', FilePatterns.astro, ['**/*.astro', '**/*.astro/**/*.{js,ts}']],
    ['astroModules', FilePatterns.astroModules, ['**/*.astro']],
    ['astroScript', FilePatterns.astroScript, ['**/*.astro/**/*.{js,ts}']],
    ['cjs', FilePatterns.cjs, ['**/*.{cjs,cts}']],
    ['cypress', FilePatterns.cypress, ['**/*.cy.{js,ts}']],
    ['esm', FilePatterns.esm, ['**/*.{mjs,mts}']],
    ['js', FilePatterns.js, ['**/*.{js,cjs,mjs,jsx}']],
    ['testJs', FilePatterns.testJs, ['**/*.{spec,test}.{js,jsx}']],
    ['react', FilePatterns.react, ['**/*.{js,ts,jsx,tsx}']],
    ['reactJs', FilePatterns.reactJs, ['**/*.{js,jsx}']],
    ['reactTs', FilePatterns.reactTs, ['**/*.{ts,tsx}']],
    ['source', FilePatterns.source, ['**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx,astro}']],
    ['test', FilePatterns.test, ['**/*.{spec,test}.{js,jsx,ts,tsx}']],
    ['ts', FilePatterns.ts, ['**/*.{ts,cts,mts,tsx}']],
    ['testTs', FilePatterns.testTs, ['**/*.{spec,test}.{ts,tsx}']],
  ] satisfies [string, FilePatterns, string[]][]
  it.each(testCases)(
    'returns the expected patterns for "FilePatterns.%s"',
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
