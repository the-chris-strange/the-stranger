import type { SortOptions } from './types.js'

import { sortYamlString } from './yaml.js'

const FENCE = '---'

export function sortFrontmatter(input: string, options: SortOptions = {}): string {
  if (!input.startsWith(FENCE)) {
    return input
  }

  const afterOpen = FENCE.length
  const ch = input[afterOpen]

  if (ch !== '\n' && ch !== '\r') {
    return input
  }

  const bodyStart = afterOpen + (ch === '\r' && input[afterOpen + 1] === '\n' ? 2 : 1)
  const closeRe = /\r?\n---(?=\r?\n|$)/g
  closeRe.lastIndex = bodyStart
  const m = closeRe.exec(input)

  if (!m) {
    return input
  }

  const yamlText = input.slice(bodyStart, m.index)
  let sorted: string

  try {
    sorted = sortYamlString(yamlText, options)
  } catch {
    return input
  }

  if (sorted.endsWith('\n')) {
    sorted = sorted.slice(0, -1)
  }

  if (ch === '\r') {
    sorted = sorted.replaceAll('\n', '\r\n')
  }

  return input.slice(0, bodyStart) + sorted + input.slice(m.index)
}
