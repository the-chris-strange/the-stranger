import type { PropertyPath } from './types'

import { getPathSegments } from './path-segments'

/**
 * Traverse a value and return the member at a property path.
 *
 * String paths use the property-path parser. Parsed paths and iterables of
 * property keys can be supplied when parsing has already occurred or when a
 * path contains a symbol. Numeric segments use `Array.prototype.at` semantics
 * when traversing an array, including support for negative indexes.
 * @param value Value to traverse.
 * @param path Property path source, parsed path, or iterable of path segments.
 * @returns The value at the path, or `undefined` when traversal reaches a
 * nullish value or an array index does not exist.
 */
export function getProperty(value: unknown, path: PropertyPath): unknown {
  let current = value

  for (const key of getPathSegments(path)) {
    if (current instanceof Map) {
      current = current.get(key)
      continue
    }

    if (Array.isArray(current) && typeof key === 'number') {
      current = Number.isInteger(key) ? current.at(key) : undefined
      continue
    }

    if (current === null || current === undefined) {
      return undefined
    }

    current = (current as Record<PropertyKey, unknown>)[key]
  }

  return current
}
