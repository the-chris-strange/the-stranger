/**
 * Match a path; ** spans zero or more segments, and [*] matches an array index.
 * @param pattern dotted properties, bracketed indices, and wildcards
 * @param path property names and original array indices
 * @returns true if the pattern matches the complete path; false otherwise
 */
export function matchesPattern(pattern: string, path: PathSegment[]): boolean {
  const tokens = tokenize(pattern)
  const memo = new Map<string, boolean>()

  const matchAt = (t: number, p: number): boolean => {
    const key = `${t}:${p}`
    const cached = memo.get(key)

    if (cached !== undefined) return cached

    const token = tokens[t]
    let result: boolean

    if (!token) {
      result = p === path.length
    } else if (token.kind === 'key' && token.value === '**') {
      result = matchAt(t + 1, p) || (p < path.length && matchAt(t, p + 1))
    } else if (p === path.length) {
      result = false
    } else if (token.kind === 'index') {
      result =
        typeof path[p] === 'number' &&
        (token.value === '*' || token.value === String(path[p])) &&
        matchAt(t + 1, p + 1)
    } else {
      const expression = token.value
        .split('*')
        .map(part => part.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`))
        .join('.*')

      result =
        typeof path[p] === 'string' &&
        new RegExp(`^${expression}$`).test(path[p]) &&
        matchAt(t + 1, p + 1)
    }
    memo.set(key, result)
    return result
  }

  return matchAt(0, 0)
}

/**
 * Format property names and array indices as a dotted document path.
 * @param path property names and original array indices
 * @returns the dotted path with bracketed array indices
 */
export function pathToString(path: PathSegment[]): string {
  return path.reduce<string>(
    (text, segment) =>
      typeof segment === 'number'
        ? `${text}[${segment}]`
        : `${text}${text ? '.' : ''}${segment}`,
    '',
  )
}

export type PathSegment = number | string

function tokenize(pattern: string): Token[] {
  const tokens: Token[] = []
  const expression = /([^.[\]]+)|\[([^\]]+)\]/g

  let consumed = 0
  for (const match of pattern.matchAll(expression)) {
    const gap = pattern.slice(consumed, match.index)
    if (gap !== '' && gap !== '.') {
      throw new Error(`Invalid pathPattern: ${pattern}`)
    }

    tokens.push(
      match[1] === undefined
        ? { kind: 'index', value: match[2] }
        : { kind: 'key', value: match[1] },
    )
    consumed = match.index + match[0].length
  }

  if (consumed !== pattern.length) {
    throw new Error(`Invalid pathPattern: ${pattern}`)
  }

  return tokens
}

type Token = { kind: 'index' | 'key'; value: string }
