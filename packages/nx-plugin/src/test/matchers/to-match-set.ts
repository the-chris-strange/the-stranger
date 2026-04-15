import 'vitest'

import { expect } from 'vitest'

interface SetMatchers<R = unknown> {
  toMatchSet: <T>(expected: Set<T> | T[]) => R
}

declare module 'vitest' {
  interface Matchers<T> extends SetMatchers<T> {}
}

expect.extend({
  toMatchSet<T>(actual: Set<T>, expected: Set<T> | T[]) {
    const { equals, isNot, utils } = this
    const expectedSet = new Set(expected)
    const expectedValues = [...expectedSet].sort()
    const receivedValues = [...actual].sort()
    const message = () => {
      const e = utils.stringify(expectedSet)
      const a = utils.stringify(actual)
      return `expected ${a} ${isNot ? 'not ' : ''}to be ${e}`
    }
    return {
      actual,
      expected: expectedSet,
      message,
      pass: equals(expectedValues, receivedValues, undefined, true),
    }
  },
})
