import {
  type Document,
  type Node,
  type Pair,
  type YAMLMap,
  type YAMLSeq,
  isAlias,
  isMap,
  isNode,
  isScalar,
  isSeq,
  parseAllDocuments,
} from 'yaml'

import type { PathSegment } from './path.js'
import type { SortOptions } from './types.js'

import {
  resolveArrayValueOptions,
  resolveObjectKeyOptions,
  sortArrayItems,
  sortObjectItems,
  sortValue,
} from './core.js'

export function sortYamlString(input: string, options: SortOptions = {}): string {
  const documents = parseAllDocuments(input)
  for (const doc of documents) {
    if (doc.errors.length > 0) throw doc.errors[0]
    if (doc.contents) {
      const constraints = buildAnchorConstraints(doc.contents)
      sortYamlNode(doc.contents, [], options, doc, constraints)
    }
  }
  // parseAllDocuments returns no documents for an empty/comment-only stream.
  return documents.length ? documents.map(doc => doc.toString()).join('') : input
}

export function sortYamlValue<T>(value: T, options: SortOptions = {}): T {
  return sortValue(value, options)
}

function buildAnchorConstraints(root: Node): AnchorConstraints {
  const constraints: AnchorConstraints = new Map()
  const declarations = new Map<string, Frame[]>()
  const references = new Map<string, Frame[][]>()
  const stack: Frame[] = []
  const constrain = (before: Frame[] | undefined, after: Frame[]): void => {
    if (!before) return
    let i = 0
    while (i < before.length && i < after.length && before[i].item === after[i].item)
      i++
    const left = before[i]
    const right = after[i]
    if (!left || !right || left.collection !== right.collection) return
    const edges = constraints.get(left.collection) ?? []
    edges.push({ after: right.item, before: left.item })
    constraints.set(left.collection, edges)
  }
  const record = (name: string, alias: boolean): void => {
    const declaration = declarations.get(name)
    constrain(declaration, stack)
    if (alias) {
      const aliases = references.get(name) ?? []
      aliases.push([...stack])
      references.set(name, aliases)
    } else {
      // A reference must also remain before the next declaration with this name.
      for (const reference of references.get(name) ?? []) constrain(reference, stack)
      references.set(name, [])
      declarations.set(name, [...stack])
    }
  }
  const walk = (node: unknown): void => {
    if (!node || typeof node !== 'object') return
    if (isAlias(node)) {
      record(node.source, true)
      return
    }
    if ('anchor' in node && typeof node.anchor === 'string') record(node.anchor, false)
    if (isMap(node)) {
      for (const pair of node.items) {
        stack.push({ collection: node, item: pair })
        walk(pair.key)
        walk(pair.value)
        stack.pop()
      }
    } else if (isSeq(node)) {
      for (const item of node.items) {
        stack.push({ collection: node, item })
        walk(item)
        stack.pop()
      }
    }
  }
  walk(root)
  return constraints
}

function pairKey(pair: Pair): boolean | number | string | null {
  const k = pair.key
  if (k === null || k === undefined) return null
  if (isScalar(k)) {
    const v = (k as { value: unknown }).value
    if (
      typeof v === 'string' ||
      typeof v === 'number' ||
      typeof v === 'boolean' ||
      v === null
    )
      return v
    return JSON.stringify(v)
  }
  if (typeof k === 'string' || typeof k === 'number' || typeof k === 'boolean') return k
  return JSON.stringify(k)
}

function pickFirstPresentMapKey(map: YAMLMap, keys: string[], doc: Document): unknown {
  for (const k of keys) {
    for (const pair of map.items) {
      if (String(pairKey(pair)) === k) {
        return toPlain(pair.value, doc)
      }
    }
  }
  return undefined
}
function reorderForAnchors<T>(items: T[], edges: AnchorConstraint[] | undefined): void {
  if (!edges?.length) return
  const pending = new Set<T>(items)
  const result: T[] = []
  while (pending.size > 0) {
    let found = false
    for (const item of pending) {
      if (edges.some(edge => edge.after === item && pending.has(edge.before as T)))
        continue
      result.push(item)
      pending.delete(item)
      found = true
      break
    }
    if (!found) throw new Error('Cannot preserve YAML anchor order')
  }
  items.splice(0, items.length, ...result)
}
function sortYamlMap(
  node: YAMLMap,
  path: PathSegment[],
  options: SortOptions,
  doc: Document,
  constraints: AnchorConstraints,
): void {
  // Recurse first.
  for (const pair of node.items) {
    const key = pairKey(pair)
    const segment: number | string = typeof key === 'number' ? key : String(key)
    if (pair.value && typeof pair.value === 'object') {
      sortYamlNode(pair.value as Node, [...path, segment], options, doc, constraints)
    }
  }

  const resolved = resolveObjectKeyOptions(path, options)
  if (node.items.length < resolved.minKeys) return

  const items = sortObjectItems(node.items, resolved, pair => String(pairKey(pair)))
  reorderForAnchors(items, constraints.get(node))
  node.items = items
}

function sortYamlNode(
  node: Node,
  path: PathSegment[],
  options: SortOptions,
  doc: Document,
  constraints: AnchorConstraints,
): void {
  if (isMap(node)) {
    sortYamlMap(node, path, options, doc, constraints)
  } else if (isSeq(node)) {
    sortYamlSeq(node, path, options, doc, constraints)
  }
}

function sortYamlSeq(
  node: YAMLSeq,
  path: PathSegment[],
  options: SortOptions,
  doc: Document,
  constraints: AnchorConstraints,
): void {
  // Recurse first.
  for (const [i, item] of node.items.entries()) {
    if (item && typeof item === 'object') {
      sortYamlNode(item as Node, [...path, i], options, doc, constraints)
    }
  }

  const resolved = resolveArrayValueOptions(path, options)
  if (node.items.length < resolved.minValues) return

  const items = sortArrayItems(node.items, resolved, {
    getKey: (item, keys) => pickFirstPresentMapKey(item as YAMLMap, keys, doc),
    getValue: item => toPlain(item, doc),
    isObject: isMap,
  })
  reorderForAnchors(items, constraints.get(node))
  node.items = items
}

function toPlain(node: unknown, doc: Document): unknown {
  return isNode(node) ? node.toJS(doc) : node
}

type AnchorConstraint = { after: unknown; before: unknown }

type AnchorConstraints = Map<Collection, AnchorConstraint[]>

// Preserve declaration order and alias bindings, allowing sibling aliases to sort.
// This keeps both declaration-before-reference and repeated-name binding intact.
// Constraints apply at the first differing map pair or sequence item.
type Collection = YAMLMap | YAMLSeq

type Frame = { collection: Collection; item: unknown }
