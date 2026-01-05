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

  if (isIterable(value)) {
    return [...iterate(value)].every(e => isEmpty(e, depth - 1))
  }

  return false
}

function isIterable<T>(value: unknown): value is IterableLike<T> {
  return (
    Array.isArray(value) ||
    value instanceof Set ||
    value instanceof Map ||
    (typeof value === 'object' && value !== null)
  )
}

function* iterate<T>(value: IterableLike<T>) {
  for (const v of toIterable(value)) {
    yield v
  }
}

function toIterable<T>(value: IterableLike<T>) {
  if (Array.isArray(value) || value instanceof Set) {
    return value
  }

  if (value instanceof Map) {
    return value.values()
  }

  if (typeof value === 'object' && value !== null) {
    return Object.values(value)
  }

  throw new TypeError(`Failed to iterate over object of type ${typeof value}`, {
    cause: { type: typeof value, value },
  })
}

type IterableLike<T> =
  | Map<any, T>
  | NodeJS.TypedArray
  | Set<T>
  | T[]
  | { [key: number | string | symbol]: T }
