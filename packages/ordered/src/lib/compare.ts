import type { SortType } from './types.js'

export function makeStringComparator(opts: ComparatorOptions): Comparator<string> {
  const direction = opts.direction === 'desc' ? -1 : 1
  const sortType = opts.sortType ?? 'locale'
  switch (sortType) {
    case 'lexical':
      return (a, b) => {
        const left = opts.caseSensitive ? a : a.toLowerCase()
        const right = opts.caseSensitive ? b : b.toLowerCase()
        return direction * (left < right ? -1 : left > right ? 1 : 0) || 0
      }
    case 'locale':
    case 'natural': {
      const collator = new Intl.Collator(undefined, {
        numeric: sortType === 'natural',
        sensitivity: opts.caseSensitive ? 'variant' : 'accent',
      })
      return (a, b) => direction * collator.compare(a, b) || 0
    }
    default:
      throw new TypeError('Unsupported sort type; expected lexical, locale, or natural')
  }
}

export function makeValueComparator(opts: ComparatorOptions): Comparator<unknown> {
  const compareStrings = makeStringComparator(opts)
  const direction = sortDirection(opts.direction)

  return (lhs, rhs) => {
    const rl = rankOf(lhs)
    const rr = rankOf(rhs)

    if (rl !== rr) {
      return direction * (rl - rr)
    }

    if (typeof lhs === 'number' && typeof rhs === 'number') {
      if (lhs === rhs) {
        return 0
      }

      return direction * (lhs < rhs ? -1 : 1)
    }

    if (typeof lhs === 'boolean' && typeof rhs === 'boolean') {
      if (lhs === rhs) {
        return 0
      }

      return direction * (lhs ? 1 : -1)
    }

    if (typeof lhs === 'string' && typeof rhs === 'string') {
      return compareStrings(lhs, rhs)
    }

    return 0
  }
}

export interface ComparatorOptions {
  /**
   * Make comparison case sensitive.
   */
  caseSensitive: boolean
  /**
   * Sort direction, either 'asc' or 'desc'.
   * @default 'asc'
   */
  direction: 'asc' | 'desc'
  /**
   * String comparison mode.
   * @default 'locale'
   */
  sortType?: SortType
}

// Lower rank sorts first in ascending order.
function rankOf(v: unknown): number {
  if (v === null) return 0
  if (v === undefined) return 1
  if (typeof v === 'boolean') return 2
  if (typeof v === 'number') return 3
  if (typeof v === 'string') return 4
  if (Array.isArray(v)) return 5
  if (typeof v === 'object') return 6
  return 7
}

function sortDirection(direction?: ComparatorOptions['direction']) {
  return direction === 'desc' ? -1 : 1
}

type Comparator<T> = (lhs: T, rhs: T) => number
