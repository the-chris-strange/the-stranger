import { describe, expect, it } from 'vitest'

import { createRecursivePattern, createRecursiveTestPattern } from './globs.js'

describe('createRecursivePattern', () => {
  it('flattens nested arrays from input', () => {
    expect(createRecursivePattern('js', ['jsx', 'cjs'])).toBe('**/*.{js,jsx,cjs}')
  })

  it('removes duplicate values', () => {
    expect(createRecursivePattern('.js', ['.ts', '.js'])).toBe('**/*.{js,ts}')
  })
})

describe('createRecursiveTestPattern', () => {
  it('flattens nested arrays from input', () => {
    expect(createRecursiveTestPattern('js', ['jsx', 'cjs'])).toBe(
      '**/*.{spec,test}.{js,jsx,cjs}',
    )
  })

  it('removes duplicate values', () => {
    expect(createRecursiveTestPattern('.js', ['.ts', '.js'])).toBe(
      '**/*.{spec,test}.{js,ts}',
    )
  })
})
