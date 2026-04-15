/**
 * Check if a value is null, undefined, an empty string or array, or an empty object, recursively up to {@link depth}.
 * @param value a value that may be empty
 * @param depth the maximum depth to search for nested objects
 * @returns true if the value is empty
 */
export function isEmpty(value: unknown, depth = 3e3): boolean {
  const nonEmptyTypes = ['bigint', 'boolean', 'function', 'number', 'symbol']

  if (depth < 0 || nonEmptyTypes.includes(typeof value)) {
    return false
  } else if (value === null || value === undefined || value === '') {
    return true
  } else if (typeof value === 'string') {
    try {
      return isEmpty(JSON.parse(value), depth)
    } catch {
      return value.trim().length === 0
    }
  }

  let iterator: Iterable<unknown> | undefined = undefined

  if (Array.isArray(value) || value instanceof Set) {
    iterator = value[Symbol.iterator]()
  } else if (value instanceof Map) {
    iterator = value.values()
  } else if (value !== null && typeof value === 'object') {
    iterator = Object.values(value)
  }

  if (iterator !== undefined) {
    return [...iterator].every(e => isEmpty(e, depth - 1))
  }

  return false
}
