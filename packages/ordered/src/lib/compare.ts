export function makeStringComparator(opts: ComparatorOptions): Comparator<string> {
  const collator = new Intl.Collator(undefined, {
    numeric: opts.natural,
    sensitivity: opts.caseSensitive ? 'variant' : 'accent',
  })
  const dir = opts.direction === 'desc' ? -1 : 1
  return (a, b) => dir * collator.compare(a, b) || 0
}

export function makeValueComparator(opts: ComparatorOptions): Comparator<unknown> {
  const compareStrings = makeStringComparator(opts)
  const direction = sortDirection(opts.direction)

  return (lhs, rhs) => {
    const ra = rankOf(lhs)
    const rb = rankOf(rhs)
    if (ra !== rb) return direction * (ra - rb)
    if (typeof lhs === 'number' && typeof rhs === 'number') {
      if (lhs === rhs) return 0
      return direction * (lhs < rhs ? -1 : 1)
    }
    if (typeof lhs === 'boolean' && typeof rhs === 'boolean') {
      if (lhs === rhs) return 0
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
   * Change the sort direction.
   * @default 'asc'
   */
  direction: 'asc' | 'desc'
  /**
   * Use natural sorting (e.g. 3 < 10).
   */
  natural: boolean
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
