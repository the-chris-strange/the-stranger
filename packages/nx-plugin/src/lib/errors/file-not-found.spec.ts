import { describe, expect, it } from 'vitest'

import { FileNotFoundError } from './file-not-found'

describe('FileNotFoundError', () => {
  it('can be constructed', () => {
    expect(() => {
      new FileNotFoundError('')
    }).not.toThrow()
  })

  it('sets the error name', () => {
    expect(new FileNotFoundError('')).toHaveProperty('name', 'FileNotFoundError')
  })

  it('sets the error message', () => {
    const filepath = 'the/path'
    expect(new FileNotFoundError(filepath)).toHaveProperty(
      'message',
      `No file found at '${filepath}'`,
    )
  })
})
