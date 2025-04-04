/**
 * Check if a value is null, undefined, an empty string or array, or an empty object. Searching deeply nested objects is supported, though this is limited to 200 levels because if an object is that large, it shouldn't really be considered empty.
 * @param value a value that may be empty
 * @param maxDepth the maximum depth to search for values
 * @returns true if the value is empty
 */
export function isEmpty(value: unknown, maxDepth = 3): boolean {
  if (maxDepth > 200) {
    throw new RangeError(`Maximum depth exceeded; ${maxDepth} > 200`)
  }

  const shallowEmpty =
    value === null ||
    value === undefined ||
    ((Array.isArray(value) || typeof value === 'string') && value.length === 0) ||
    (typeof value === 'object' && Object.keys(value).length === 0)

  if (shallowEmpty) {
    return true
  } else if (maxDepth > 0) {
    const values = Array.isArray(value) ? value : Object.values(value)
    return values.every(e => isEmpty(e, maxDepth - 1))
  }

  return false
}
