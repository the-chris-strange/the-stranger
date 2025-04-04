import { describe, expect, it } from 'vitest'

import { addPeriod } from './add-period'

describe('addPeriod', () => {
  it('adds a period to a string that does not end with one', () => {
    expect(addPeriod('hello')).toBe('hello.')
  })

  it('does not add a period to a string that already ends with one', () => {
    expect(addPeriod('hello.')).toBe('hello.')
  })
})
