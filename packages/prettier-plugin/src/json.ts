import {
  buildNamedOrderRanks,
  makeStringComparator,
  resolveObjectKeyOptions,
  sortArrayValues,
} from '@the-stranger/ordered'

import type { PathSegment, SortOptions } from '@the-stranger/ordered'

/**
 * Apply the package policy's order to original nodes rather than serializing parsed numbers.
 * @param node original parsed node
 * @param value sorted parsed data
 */
export function applyPackageOrder(node: JsonNode, value: unknown): void {
  if (
    node.type === 'ObjectExpression' &&
    value &&
    typeof value === 'object' &&
    !Array.isArray(value)
  ) {
    const order = new Map(Object.keys(value).map((name, index) => [name, index]))
    const properties = node.properties ?? []
    const counts = new Map<string, number>()
    for (const property of properties)
      counts.set(key(property), (counts.get(key(property)) ?? 0) + 1)
    properties.sort(
      (a, b) => (order.get(key(a)) ?? Infinity) - (order.get(key(b)) ?? Infinity),
    )
    for (const property of properties) {
      // Duplicate keys must retain their individual values and last-value semantics.
      if (counts.get(key(property)) === 1)
        applyPackageOrder(
          property.value as JsonNode,
          (value as Record<string, unknown>)[key(property)],
        )
    }
  } else if (node.type === 'ArrayExpression' && Array.isArray(value)) {
    const elements = node.elements ?? []
    if (value.every(entry => typeof entry === 'string')) {
      const available = new Map<string, JsonNode[]>()
      for (const element of elements) {
        const name = jsonValue(element) as string
        const matches = available.get(name) ?? []
        matches.push(element)
        available.set(name, matches)
      }
      node.elements = value.map(entry => available.get(entry)!.shift()!)
    } else {
      // Package policies never reorder object arrays; they only order keys inside them.
      for (const [index, element] of elements.entries())
        applyPackageOrder(element, value[index])
    }
  }
}

export function jsonValue(node: JsonNode): unknown {
  if (node.type === 'ObjectExpression') {
    return Object.fromEntries(
      (node.properties ?? []).map(property => [
        key(property),
        jsonValue(property.value as JsonNode),
      ]),
    )
  }
  if (node.type === 'ArrayExpression') return (node.elements ?? []).map(jsonValue)
  if (node.type === 'NullLiteral') return null
  if (node.type === 'UnaryExpression') {
    const value = Number(jsonValue(node.argument!))
    return node.operator === '-' ? -value : value
  }
  if (node.type === 'Identifier') {
    if (node.name === 'Infinity') return Infinity
    if (node.name === 'NaN') return NaN
    return undefined
  }
  return node.value
}

export function sortJsonNode(
  node: JsonNode,
  options: SortOptions,
  path: PathSegment[] = [],
): void {
  if (node.type === 'ObjectExpression') {
    const properties = node.properties ?? []
    for (const property of properties)
      sortJsonNode(property.value as JsonNode, options, [...path, key(property)])
    const resolved = resolveObjectKeyOptions(path, options)
    if (properties.length < resolved.minKeys) return
    const { rankByKey, restCmpOpts } = buildNamedOrderRanks(resolved)
    const compare = makeStringComparator(restCmpOpts)
    properties.sort((a, b) => {
      const nameA = key(a)
      const nameB = key(b)
      const rankA = rankByKey.get(nameA)
      const rankB = rankByKey.get(nameB)
      if (rankA !== undefined || rankB !== undefined)
        return (rankA ?? Infinity) - (rankB ?? Infinity)
      return compare(nameA, nameB)
    })
  } else if (node.type === 'ArrayExpression') {
    const elements = node.elements ?? []
    for (const [index, element] of elements.entries())
      sortJsonNode(element, options, [...path, index])
    const values = elements.map(jsonValue)
    const nodes = new Map<unknown, JsonNode[]>()
    for (const [index, value] of values.entries()) {
      const matches = nodes.get(value) ?? []
      matches.push(elements[index])
      nodes.set(value, matches)
    }
    node.elements = sortArrayValues(values, path, options).map(value =>
      nodes.get(value)!.shift()!,
    )
  }
}

/** The JSON subset of Prettier's Babel AST; nodes retain source spelling and comments. */
export interface JsonNode {
  type: string
  argument?: JsonNode
  comments?: { value: string }[]
  elements?: JsonNode[]
  key?: JsonNode
  name?: string
  node?: JsonNode
  operator?: string
  properties?: JsonNode[]
  value?: unknown
}

function key(node: JsonNode): string {
  return String(node.key?.value ?? node.key?.name)
}
