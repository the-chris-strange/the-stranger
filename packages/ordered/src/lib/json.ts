import type { SortJsonStringOptions, SortOptions } from './types.js'

import { sortValue } from './core.js'

export function sortJsonString(
  input: string,
  options: SortJsonStringOptions = {},
): string {
  const parsed: unknown = JSON.parse(input)
  const sorted = sortValue(parsed, options)
  const indent = options.indent ?? 2
  return JSON.stringify(sorted, null, indent)
}

export function sortJsonValue<T>(value: T, options: SortOptions = {}): T {
  return sortValue(value, options)
}
