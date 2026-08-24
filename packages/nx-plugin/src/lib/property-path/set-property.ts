import type { PropertyPath, PropertyPathSegment } from './types'

import { getPathSegments } from './path-segments'

const forbiddenProperties: ReadonlySet<string> = new Set([
  '__proto__',
  'constructor',
  'prototype',
])
const maximumArrayIndex = 2 ** 32 - 2

/**
 * Set a value at a property path, creating intermediate objects or arrays.
 *
 * The supplied root object is mutated and returned. Traversal only follows own
 * object properties, preventing an inherited object from being mutated. The
 * prototype-related keys `__proto__`, `constructor`, and `prototype` are
 * rejected for object properties. Maps use their normal key semantics.
 * @param object Object to update.
 * @param path Property path source, parsed path, or iterable of path segments.
 * @param value Value to assign.
 * @returns The supplied root object.
 */
export function setProperty<T extends object>(
  object: T,
  path: PropertyPath,
  value: unknown,
): T {
  const segments = [...getPathSegments(path)]
  if (segments.length === 0) return object

  let current: unknown = object

  for (let index = 0; index < segments.length - 1; index += 1) {
    const key = segments[index]
    const nextKey = segments[index + 1]
    current = getOrCreateChild(current, key, nextKey)
  }

  setChild(current, segments.at(-1)!, value)

  return object
}

function assertPropertyContainer(
  value: unknown,
): asserts value is Record<PropertyKey, unknown> {
  if (value === null || (typeof value !== 'object' && typeof value !== 'function')) {
    throw new TypeError('Cannot traverse a non-object value while setting a path')
  }
}

function assertSafePropertyKey(key: PropertyPathSegment) {
  if (typeof key === 'string' && forbiddenProperties.has(key)) {
    throw new TypeError(
      `Cannot set the forbidden property path segment ${formatPropertyKey(key)}`,
    )
  }
}

function createContainer(nextKey: PropertyPathSegment) {
  return typeof nextKey === 'number' ? [] : {}
}

function formatPropertyKey(key: PropertyPathSegment) {
  return typeof key === 'symbol' ? key.toString() : JSON.stringify(key)
}

function getOrCreateChild(
  current: unknown,
  key: PropertyPathSegment,
  nextKey: PropertyPathSegment,
): unknown {
  if (current instanceof Map) {
    const existing = current.get(key)
    if (existing !== undefined) return existing

    const child = createContainer(nextKey)
    current.set(key, child)
    return child
  }

  assertPropertyContainer(current)
  assertSafePropertyKey(key)

  const normalizedKey =
    Array.isArray(current) && typeof key === 'number'
      ? normalizeArrayIndex(current, key)
      : key
  const existing = Object.hasOwn(current, normalizedKey)
    ? Reflect.get(current, normalizedKey)
    : undefined

  if (existing !== undefined) return existing

  const child = createContainer(nextKey)
  setObjectProperty(current, normalizedKey, child)
  return child
}

function normalizeArrayIndex(array: unknown[], index: number) {
  if (!Number.isInteger(index)) {
    throw new RangeError(`Array index ${index} must be an integer`)
  }

  const normalizedIndex = index < 0 ? array.length + index : index

  if (normalizedIndex < 0 || normalizedIndex > maximumArrayIndex) {
    throw new RangeError(`Array index ${index} is out of bounds`)
  }

  return normalizedIndex
}

function setChild(current: unknown, key: PropertyPathSegment, value: unknown) {
  if (current instanceof Map) {
    current.set(key, value)
    return
  }

  assertPropertyContainer(current)
  assertSafePropertyKey(key)

  const normalizedKey =
    Array.isArray(current) && typeof key === 'number'
      ? normalizeArrayIndex(current, key)
      : key

  setObjectProperty(current, normalizedKey, value)
}

function setObjectProperty(
  object: Record<PropertyKey, unknown>,
  key: PropertyPathSegment,
  value: unknown,
) {
  if (!Reflect.set(object, key, value)) {
    throw new TypeError(`Unable to set property ${formatPropertyKey(key)}`)
  }
}
