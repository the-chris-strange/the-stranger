import { describe, expect, it } from 'vitest'

import { removeEmpty } from './remove-empty'

describe('removeEmpty', () => {
  it.each([null, undefined, {}, [], new Set(), new Map()])(
    'refuses to attempt to remove empty values from %s',
    value => {
      expect(() => {
        removeEmpty(value)
      }).toThrow()
    },
  )
})
