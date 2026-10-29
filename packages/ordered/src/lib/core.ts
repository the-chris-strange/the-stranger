import type {
  ArrayValueOptions,
  ObjectKeyOptions,
  ObjectKeyOrderEntry,
  SortOptions,
  SortOrder,
  SortType,
} from './types.js'

import {
  type ComparatorOptions,
  makeStringComparator,
  makeValueComparator,
} from './compare.js'
import { type PathSegment, matchesPattern } from './path.js'

export function buildNamedOrderRanks(resolved: ResolvedObjectKeyOptions): {
  rankByKey: Map<string, number>
  restCmpOpts: ComparatorOptions
} {
  const rankByKey = new Map<string, number>()
  let restCmpOpts: ComparatorOptions = toComparatorOpts(resolved)
  for (const [idx, entry] of (resolved.namedOrder ?? []).entries()) {
    if (typeof entry === 'string') {
      rankByKey.set(entry, idx)
    } else {
      rankByKey.set(entry.key, idx)
      if (
        entry.order !== undefined ||
        entry.caseSensitive !== undefined ||
        entry.sortType !== undefined
      ) {
        restCmpOpts = {
          ...restCmpOpts,
          caseSensitive: entry.caseSensitive ?? restCmpOpts.caseSensitive,
          direction: entry.order ?? restCmpOpts.direction,
          sortType: entry.sortType ?? restCmpOpts.sortType,
        }
      }
    }
  }
  return { rankByKey, restCmpOpts }
}

/**
 * Share array ordering across plain values and format-specific syntax nodes.
 * @param items recursively visited values or syntax nodes
 * @param resolved resolved array sorting options
 * @param adapter extract comparable values without changing item identity
 * @returns ordered original items with stable ties
 */
export function sortArrayItems<T>(
  items: T[],
  resolved: ResolvedArrayValueOptions,
  adapter: ArrayItemAdapter<T>,
): T[] {
  if (items.length < resolved.minValues) return items
  const cmpOpts = toComparatorOpts(resolved)
  const baseValueCmp = makeValueComparator(cmpOpts)
  const valueCmp = (a: unknown, b: unknown) => {
    const rankA = resolved.priority.indexOf(a as string)
    const rankB = resolved.priority.indexOf(b as string)
    if (rankA !== -1 || rankB !== -1)
      return (rankA === -1 ? Infinity : rankA) - (rankB === -1 ? Infinity : rankB)
    return baseValueCmp(a, b)
  }
  const stringCmp = makeStringComparator(cmpOpts)
  const direction = resolved.order === 'desc' ? -1 : 1
  const candidateKeys = resolveCandidateKeys(resolved)
  const decorated = items.map((item, originalIndex) => {
    const isObject = adapter.isObject(item)
    const serialized = isObject && candidateKeys.length === 0 && resolved.serialize
    let sortKey: unknown
    if (isObject && candidateKeys.length > 0) {
      sortKey = adapter.getKey(item, candidateKeys)
    } else if (serialized) {
      sortKey = stableStringify(
        adapter.getValue(item),
        resolved.sortObjectKeysBeforeSerialize,
      )
    } else {
      sortKey = isObject ? originalIndex : adapter.getValue(item)
    }
    return { isObject, item, originalIndex, serialized, sortKey }
  })
  decorated.sort((a, b) => {
    if (a.isObject !== b.isObject) return direction * (a.isObject ? 1 : -1)
    let compared = 0
    if (a.serialized && b.serialized) {
      compared = stringCmp(a.sortKey as string, b.sortKey as string)
    } else if (!a.isObject || candidateKeys.length > 0) {
      compared = valueCmp(a.sortKey, b.sortKey)
    }
    return compared || a.originalIndex - b.originalIndex
  })
  return decorated.map(({ item }) => item)
}

/**
 * Sort already-visited values while preserving their identities for format adapters.
 * @param recursed values whose nested children have already been visited
 * @param path collection path used to resolve overrides
 * @param options sorting rules
 * @returns sorted values with their original identities
 */
export function sortArrayValues<T>(
  recursed: T[],
  path: PathSegment[],
  options: SortOptions,
): T[] {
  return sortArrayItems(recursed, resolveArrayValueOptions(path, options), {
    getKey: (value, keys) =>
      pickFirstPresentKey(value as Record<string, unknown>, keys),
    getValue: value => value,
    isObject: value =>
      value !== null && typeof value === 'object' && !Array.isArray(value),
  })
}

/**
 * Sort original object items using a resolved named order and comparison policy.
 * @param items entries, syntax nodes, or map pairs to sort without mutating input
 * @param resolved resolved object-key options
 * @param key extract the property name from each item
 * @returns sorted items, leaving unspecified keys in relative order when requested
 */
export function sortObjectItems<T>(
  items: T[],
  resolved: ResolvedObjectKeyOptions,
  key: (item: T) => string,
): T[] {
  const { rankByKey, restCmpOpts } = buildNamedOrderRanks(resolved)
  const fallback = makeStringComparator(restCmpOpts)
  const compare = (a: T, b: T) => {
    const nameA = key(a)
    const nameB = key(b)
    const rankA = rankByKey.get(nameA)
    const rankB = rankByKey.get(nameB)
    if (rankA !== undefined || rankB !== undefined)
      return (rankA ?? Infinity) - (rankB ?? Infinity)
    return fallback(nameA, nameB)
  }
  if (resolved.preserveUnknownKeys && resolved.namedOrder) {
    const result = [...items]
    // Like ESLint's named-key fixes, move an inverted key after its successor.
    // Swapping fixed slots would move an unlisted key across both named keys.
    let changed = true
    while (changed) {
      changed = false
      let previous = -1
      for (let index = 0; index < result.length; index++) {
        if (!rankByKey.has(key(result[index]))) continue
        if (previous >= 0 && compare(result[previous], result[index]) > 0) {
          const [item] = result.splice(previous, 1)
          result.splice(index, 0, item)
          changed = true
          break
        }
        previous = index
      }
    }
    return result
  }
  return [...items].sort(compare)
}

export function sortValue<T>(value: T, options: SortOptions = {}): T {
  return sortNode(value, [], options) as T
}

// Canonicalize comparison values without modifying the document. A cycle marker
// allows legal recursive YAML anchors to participate in stable comparisons.
export function stableStringify(value: unknown, sortKeys: boolean): string {
  const ancestors = new WeakSet<object>()
  const normalize = (input: unknown): unknown => {
    if (input === null || typeof input !== 'object') return input
    if (ancestors.has(input)) return '[Circular]'
    ancestors.add(input)
    let result: unknown
    if (Array.isArray(input)) {
      result = input.map((entry: unknown) => normalize(entry))
    } else {
      const keys = Object.keys(input)
      // eslint-disable-next-line unicorn/require-array-sort-compare -- Use canonical UTF-16 property ordering.
      if (sortKeys) keys.sort()
      result = Object.fromEntries(
        keys.map(key => [key, normalize((input as Record<string, unknown>)[key])]),
      )
    }
    ancestors.delete(input)
    return result
  }
  return JSON.stringify(normalize(value))
}

function pickFirstPresentKey(obj: Record<string, unknown>, keys: string[]): unknown {
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) return obj[k]
  }
  return undefined
}

function resolveArrayValueOptions(
  path: PathSegment[],
  options: SortOptions,
): ResolvedArrayValueOptions {
  const base = options.arrayValues ?? {}
  const result: ResolvedArrayValueOptions = {
    caseSensitive: base.caseSensitive ?? true,
    key: base.key ?? null,
    keys: base.keys ?? [],
    minValues: base.minValues ?? 2,
    order: base.order ?? 'asc',
    priority: base.priority ?? [],
    serialize: base.serialize ?? true,
    sortObjectKeysBeforeSerialize: base.sortObjectKeysBeforeSerialize ?? true,
    sortType: base.sortType ?? 'locale',
  }
  for (const override of base.overrides ?? []) {
    if (!matchesPattern(override.pathPattern, path)) continue
    result.caseSensitive = override.caseSensitive ?? result.caseSensitive
    if (override.key !== undefined) result.key = override.key
    result.keys = override.keys ?? result.keys
    result.minValues = override.minValues ?? result.minValues
    result.order = override.order ?? result.order
    result.priority = override.priority ?? result.priority
    result.serialize = override.serialize ?? result.serialize
    result.sortObjectKeysBeforeSerialize =
      override.sortObjectKeysBeforeSerialize ?? result.sortObjectKeysBeforeSerialize
    result.sortType = override.sortType ?? result.sortType
  }
  return result
}

function resolveCandidateKeys(resolved: ResolvedArrayValueOptions): string[] {
  if (resolved.key)
    return [resolved.key, ...resolved.keys.filter(k => k !== resolved.key)]
  return resolved.keys
}

function resolveObjectKeyOptions(
  path: PathSegment[],
  options: SortOptions,
): ResolvedObjectKeyOptions {
  const base = options.objectKeys ?? {}
  const result: ResolvedObjectKeyOptions = {
    allowLineSeparatedGroups: base.allowLineSeparatedGroups ?? false,
    caseSensitive: base.caseSensitive ?? true,
    minKeys: base.minKeys ?? 2,
    namedOrder: null,
    order: base.order ?? 'asc',
    preserveUnknownKeys: base.preserveUnknownKeys ?? false,
    sortType: base.sortType ?? 'locale',
  }
  for (const override of base.overrides ?? []) {
    if (!matchesPattern(override.pathPattern, path)) continue
    if (Array.isArray(override.order)) {
      result.namedOrder = override.order
    } else if (override.order) {
      result.order = override.order
      result.namedOrder = null
    }
    result.allowLineSeparatedGroups =
      override.allowLineSeparatedGroups ?? result.allowLineSeparatedGroups
    result.caseSensitive = override.caseSensitive ?? result.caseSensitive
    result.minKeys = override.minKeys ?? result.minKeys
    result.preserveUnknownKeys =
      override.preserveUnknownKeys ?? result.preserveUnknownKeys
    result.sortType = override.sortType ?? result.sortType
  }
  return result
}

function sortArray(
  arr: unknown[],
  path: PathSegment[],
  options: SortOptions,
): unknown[] {
  // Recurse into elements first.
  const recursed = arr.map((v, i) => sortNode(v, [...path, i], options))

  return sortArrayValues(recursed, path, options)
}

function sortNode(value: unknown, path: PathSegment[], options: SortOptions): unknown {
  if (Array.isArray(value)) {
    return sortArray(value, path, options)
  }
  if (value !== null && typeof value === 'object') {
    return sortObject(value as Record<string, unknown>, path, options)
  }
  return value
}

function sortObject(
  obj: Record<string, unknown>,
  path: PathSegment[],
  options: SortOptions,
): Record<string, unknown> {
  const resolved = resolveObjectKeyOptions(path, options)
  const entries = Object.entries(obj)

  // Recurse first.
  const recursed: [string, unknown][] = entries.map(([k, v]) => [
    k,
    sortNode(v, [...path, k], options),
  ])

  if (entries.length < resolved.minKeys) {
    return Object.fromEntries(recursed)
  }

  return Object.fromEntries(sortObjectItems(recursed, resolved, ([name]) => name))
}

function toComparatorOpts(o: {
  caseSensitive: boolean
  order: SortOrder
  sortType?: SortType
}): ComparatorOptions {
  return {
    caseSensitive: o.caseSensitive,
    direction: o.order,
    sortType: o.sortType,
  }
}

interface ArrayItemAdapter<T> {
  getKey: (item: T, keys: string[]) => unknown
  getValue: (item: T) => unknown
  isObject: (item: T) => boolean
}

interface ResolvedArrayValueOptions extends Required<
  Omit<ArrayValueOptions, 'key' | 'keys'>
> {
  key: string | null
  keys: string[]
}

interface ResolvedObjectKeyOptions extends Required<
  Omit<ObjectKeyOptions, 'allowLineSeparatedGroups'>
> {
  allowLineSeparatedGroups: boolean
  namedOrder: ObjectKeyOrderEntry[] | null
}

// Re-export for downstream adapters that need to know how options resolve for a given path.
export {
  pickFirstPresentKey,
  resolveArrayValueOptions,
  resolveCandidateKeys,
  resolveObjectKeyOptions,
  toComparatorOpts,
}
export type { ResolvedArrayValueOptions, ResolvedObjectKeyOptions }
