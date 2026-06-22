import { describe, expect, it } from 'vitest'

import { combineExtensions, expandExtension } from './extensions.js'

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

  it('removes leading dots or glob patterns', () => {
    expect(expandExtension('.js')).not.toContain('.js')
    expect(expandExtension('**/*.js')).not.toContain('**/*.js')
  })
})
