/**
 * Traverse an object or array and return the value of the specified property.
 * @param obj the object to traverse
 * @param path the path to the desired property or index, or an array of property names and/or indices
 * @returns the value at the provided path
 */
export function propertyPath(obj: any, path: string | (number | string)[]) {
  const segments = typeof path === 'string' ? [...splitPropertyPath(path)] : path

  return segments.reduce((acc, key) => {
    if (acc instanceof Map) {
      return acc.get(key)
    }

    if (Array.isArray(acc) && typeof key === 'number') {
      return acc.at(key)
    }

    return acc?.[key as keyof typeof acc]
  }, obj)
}

/**
 * Set a value on an object or array using a dotted / bracketed path.
 * Creates intermediate objects or arrays as needed.
 * @param obj the object
 * @param path the path to the property to set, as a string or an array of property names and/or indices
 * @param value the value to set at the provided path
 * @returns the object, with the updated value
 */
export function setPropertyPath<T extends object>(
  obj: T,
  path: string | (number | string)[],
  value: unknown,
): T {
  const segments = typeof path === 'string' ? [...splitPropertyPath(path)] : [...path]
  if (segments.length === 0) return obj

  let current: any = obj

  for (let i = 0; i < segments.length - 1; i++) {
    const key = segments[i]
    const nextKey = segments[i + 1]

    if (current instanceof Map) {
      if (!current.has(key)) {
        current.set(key, typeof nextKey === 'number' ? [] : {})
      }
      current = current.get(key)
      continue
    }

    if (Array.isArray(current)) {
      if (typeof key !== 'number') {
        throw new TypeError(
          `Attempted to index an array with a non-numeric key (${key})`,
        )
      }

      if (current[key] === undefined) {
        current[key] = typeof nextKey === 'number' ? [] : {}
      }
      current = current[key]
      continue
    }

    if (current[key as keyof typeof current] === undefined) {
      current[key as keyof typeof current] = typeof nextKey === 'number' ? [] : {}
    }
    current = current[key as keyof typeof current]
  }

  const lastKey = segments.at(-1)

  if (current instanceof Map) {
    current.set(lastKey, value)
  } else if (Array.isArray(current) && typeof lastKey === 'number') {
    current[lastKey] = value
  } else {
    current[lastKey as keyof typeof current] = value as any
  }

  return obj
}

export function* splitPropertyPath(path: string) {
  let i = 0
  const { length } = path

  while (i < length) {
    const char = path[i]

    if (char === '.') {
      i += 1
      continue
    }

    if (char === '[') {
      i += 1
      const next = path[i]

      // Quoted property name, e.g. ["foo"] or ['foo']
      if (next === '"' || next === "'") {
        const quote = next
        i += 1
        const start = i
        while (i < length && path[i] !== quote) i += 1
        yield path.slice(start, i)
        i += 2 // skip closing quote and ]
        continue
      }

      // Numeric index, e.g. [0] or [-1]
      const start = i
      while (i < length && /[-0-9]/.test(path[i])) i += 1
      yield Number.parseInt(path.slice(start, i), 10)
      i += 1 // skip closing ]
      continue
    }

    // Bare identifier, e.g. foo or foo_bar
    const start = i
    while (i < length && !['.', '[', ']'].includes(path[i])) i += 1
    const token = path.slice(start, i)
    const maybeNumber = Number.parseInt(token, 10)
    yield Number.isNaN(maybeNumber) || `${maybeNumber}` !== token ? token : maybeNumber
  }
}
