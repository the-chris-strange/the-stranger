import { isEmpty } from './is-empty'

export function removeEmpty(value: any, depth?: number) {
  if (isEmpty(value, depth)) {
    throw new Error('Refusing to remove empty values from an empty value')
  }

  if (value instanceof Map) {
    for (const key of value.keys()) {
      if (isEmpty(value.get(key), depth ? depth - 1 : undefined)) {
        value.delete(key)
      }
    }
    return value
  }

  if (value instanceof Set) {
    return new Set([...value].filter(e => !isEmpty(e, depth ? depth - 1 : undefined)))
  }

  if (Array.isArray(value)) {
    return value.filter(e => !isEmpty(e, depth ? depth - 1 : undefined))
  }

  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).reduce(
      (acc, [k, v]) => {
        if (!isEmpty(v)) {
          acc[k] = v
        }
        return acc
      },
      {} as Record<string, any>,
    )
  }

  return value
}
