import type {
  ArrayValueOptions,
  ArrayValueOverride,
  ObjectKeyOptions,
  ObjectKeyOrderEntry,
  ObjectKeyOverride,
  SortOptions,
  SortOrder,
} from './types.js'

import {
  type ComparatorOptions,
  makeStringComparator,
  makeValueComparator,
} from './compare.js'
import { type PathSegment, matchesPattern } from './path.js'

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

const DEFAULT_OBJECT_KEY: ResolvedObjectKeyOptions = {
  allowLineSeparatedGroups: false,
  caseSensitive: true,
  minKeys: 2,
  namedOrder: null,
  natural: false,
  order: 'asc',
}

const DEFAULT_ARRAY_VALUE: ResolvedArrayValueOptions = {
  caseSensitive: true,
  key: null,
  keys: [],
  minValues: 2,
  natural: false,
  order: 'asc',
  serialize: true,
  sortObjectKeysBeforeSerialize: true,
}

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
        entry.natural !== undefined
      ) {
        restCmpOpts = {
          caseSensitive: entry.caseSensitive ?? restCmpOpts.caseSensitive,
          direction: entry.order ?? restCmpOpts.direction,
          natural: entry.natural ?? restCmpOpts.natural,
        }
      }
    }
  }
  return { rankByKey, restCmpOpts }
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
  const resolved = resolveArrayValueOptions(path, options)
  if (recursed.length < resolved.minValues) return recursed

  // Mixed scalar/object: scalars sort by value, objects via configured strategy. Tie-break: scalars come before objects in asc, after in desc.
  const cmpOpts = toComparatorOpts(resolved)
  const valueCmp = makeValueComparator(cmpOpts)
  const stringCmp = makeStringComparator(cmpOpts)
  const dir = resolved.order === 'desc' ? -1 : 1

  const candidateKeys = resolveCandidateKeys(resolved)
  const useSerialize = resolved.serialize

  const decorated = recursed.map((v, originalIndex) => {
    const isObj = v !== null && typeof v === 'object' && !Array.isArray(v)
    let sortKey: unknown
    let comparedAsString = false
    if (isObj && candidateKeys.length > 0) {
      sortKey = pickFirstPresentKey(v as Record<string, unknown>, candidateKeys)
    } else if (isObj && useSerialize) {
      sortKey = stableStringify(v, resolved.sortObjectKeysBeforeSerialize)
      comparedAsString = true
    } else if (isObj) {
      // Without a comparison key, retain relative object order.
      sortKey = originalIndex
      comparedAsString = false
    } else {
      sortKey = v
    }
    return { comparedAsString, isObj, originalIndex, sortKey, v }
  })

  decorated.sort((a, b) => {
    if (a.isObj !== b.isObj) {
      return dir * (a.isObj ? 1 : -1)
    }
    if (a.isObj) {
      if (a.comparedAsString && b.comparedAsString) {
        const c = stringCmp(a.sortKey as string, b.sortKey as string)
        if (c !== 0) return c
      } else if (candidateKeys.length > 0) {
        const c = valueCmp(a.sortKey, b.sortKey)
        if (c !== 0) return c
      }
      // serialize=false, no key → stable
    } else {
      const c = valueCmp(a.sortKey, b.sortKey)
      if (c !== 0) return c
    }
    return a.originalIndex - b.originalIndex
  })

  return decorated.map(d => d.v)
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

function applyArrayOverride(
  base: ResolvedArrayValueOptions,
  ov: ArrayValueOverride,
): ResolvedArrayValueOptions {
  const out = { ...base }
  if (ov.order !== undefined) out.order = ov.order
  if (ov.caseSensitive !== undefined) out.caseSensitive = ov.caseSensitive
  if (ov.natural !== undefined) out.natural = ov.natural
  if (ov.minValues !== undefined) out.minValues = ov.minValues
  if (ov.key !== undefined) out.key = ov.key
  if (ov.keys !== undefined) out.keys = ov.keys
  if (ov.serialize !== undefined) out.serialize = ov.serialize
  if (ov.sortObjectKeysBeforeSerialize !== undefined)
    out.sortObjectKeysBeforeSerialize = ov.sortObjectKeysBeforeSerialize
  return out
}

function applyObjectOverride(
  base: ResolvedObjectKeyOptions,
  ov: ObjectKeyOverride,
): ResolvedObjectKeyOptions {
  const out = { ...base }
  if (Array.isArray(ov.order)) {
    out.namedOrder = ov.order
  } else if (ov.order) {
    out.order = ov.order
    out.namedOrder = null
  }
  if (ov.caseSensitive !== undefined) out.caseSensitive = ov.caseSensitive
  if (ov.natural !== undefined) out.natural = ov.natural
  if (ov.minKeys !== undefined) out.minKeys = ov.minKeys
  if (ov.allowLineSeparatedGroups !== undefined)
    out.allowLineSeparatedGroups = ov.allowLineSeparatedGroups
  return out
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
  let result: ResolvedArrayValueOptions = {
    ...DEFAULT_ARRAY_VALUE,
    caseSensitive: base.caseSensitive ?? DEFAULT_ARRAY_VALUE.caseSensitive,
    key: base.key ?? null,
    keys: base.keys ?? [],
    minValues: base.minValues ?? DEFAULT_ARRAY_VALUE.minValues,
    natural: base.natural ?? DEFAULT_ARRAY_VALUE.natural,
    order: base.order ?? DEFAULT_ARRAY_VALUE.order,
    serialize: base.serialize ?? DEFAULT_ARRAY_VALUE.serialize,
    sortObjectKeysBeforeSerialize:
      base.sortObjectKeysBeforeSerialize ??
      DEFAULT_ARRAY_VALUE.sortObjectKeysBeforeSerialize,
  }
  const overrides = base.overrides ?? []
  for (const ov of overrides) {
    if (matchesPattern(ov.pathPattern, path)) {
      result = applyArrayOverride(result, ov)
    }
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
  let result: ResolvedObjectKeyOptions = {
    ...DEFAULT_OBJECT_KEY,
    allowLineSeparatedGroups:
      base.allowLineSeparatedGroups ?? DEFAULT_OBJECT_KEY.allowLineSeparatedGroups,
    caseSensitive: base.caseSensitive ?? DEFAULT_OBJECT_KEY.caseSensitive,
    minKeys: base.minKeys ?? DEFAULT_OBJECT_KEY.minKeys,
    namedOrder: null,
    natural: base.natural ?? DEFAULT_OBJECT_KEY.natural,
    order: base.order ?? DEFAULT_OBJECT_KEY.order,
  }
  const overrides = base.overrides ?? []
  for (const ov of overrides) {
    if (matchesPattern(ov.pathPattern, path)) {
      result = applyObjectOverride(result, ov)
    }
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

function sortByNamedOrder(
  entries: [string, unknown][],
  resolved: ResolvedObjectKeyOptions,
): [string, unknown][] {
  const { rankByKey, restCmpOpts } = buildNamedOrderRanks(resolved)
  const fallbackCmp = makeStringComparator(restCmpOpts)
  return [...entries].sort(([a], [b]) => {
    const ra = rankByKey.get(a)
    const rb = rankByKey.get(b)
    if (ra !== undefined && rb !== undefined) return ra - rb
    if (ra !== undefined) return -1
    if (rb !== undefined) return 1
    return fallbackCmp(a, b)
  })
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

  let sorted: [string, unknown][]
  if (resolved.namedOrder && resolved.namedOrder.length > 0) {
    sorted = sortByNamedOrder(recursed, resolved)
  } else {
    const cmp = makeStringComparator(toComparatorOpts(resolved))
    sorted = [...recursed].sort(([a], [b]) => cmp(a, b))
  }
  return Object.fromEntries(sorted)
}

function toComparatorOpts(o: {
  caseSensitive: boolean
  natural: boolean
  order: SortOrder
}): ComparatorOptions {
  return { caseSensitive: o.caseSensitive, direction: o.order, natural: o.natural }
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
