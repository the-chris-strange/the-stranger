/**
 * Get an array of values from a possibly nullish value.
 * @param value the input value
 * @template T the type of value array to return
 * @returns an array of values
 */
export function toArray<T>(value?: (T | null | undefined)[] | T | null): T[] {
  if (value === null || value === undefined) {
    return []
  } else if (Array.isArray(value)) {
    return value.flatMap(e => toArray(e))
  } else {
    return [value]
  }
}
