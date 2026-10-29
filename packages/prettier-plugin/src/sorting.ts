import {
  sortMarkdownFrontmatter,
  sortPackageJson,
  sortYamlString,
} from '@the-stranger/ordered'
import { parsers as jsonParsers } from 'prettier/plugins/babel'
import { parsers as markdownParsers } from 'prettier/plugins/markdown'
import { parsers as yamlParsers } from 'prettier/plugins/yaml'

import type { SortOptions } from '@the-stranger/ordered'
import type { Options, Parser, Plugin } from 'prettier'

import { configurationSortOptions } from './configuration-sorting.js'
import { type JsonNode, applyPackageOrder, jsonValue, sortJsonNode } from './json.js'

// Native Prettier options remain validated by Prettier; structured rules use the typed factory.
declare module 'prettier' {
  interface RequiredOptions {
    orderedSort: boolean
    orderedSortArrays: boolean
    orderedSortConfigFiles: boolean
    orderedSortPackageJson: boolean
    packageSortOrder: string[]
  }
}

export const options: NonNullable<Plugin['options']> = {
  orderedSort: {
    category: 'Global',
    default: true,
    description: 'Sort data objects and frontmatter with Ordered.',
    type: 'boolean',
  },
  orderedSortArrays: {
    category: 'Global',
    default: false,
    description: 'Sort data arrays as well as object keys.',
    type: 'boolean',
  },
  orderedSortConfigFiles: {
    category: 'Global',
    default: false,
    description: 'Special sorting rules for some common configuration files.',
    type: 'boolean',
  },
  orderedSortPackageJson: {
    category: 'Global',
    default: true,
    description: 'Use the package.json sorting policy.',
    type: 'boolean',
  },
  packageSortOrder: {
    array: true,
    category: 'Global',
    default: [{ value: [] }],
    description: 'Place these package.json fields before the default field order.',
    type: 'string',
  },
}

/**
 * Create a sorting plugin with Ordered's typed comparison and per-path rules.
 * @param rules comparison options and per-path sorting overrides
 * @returns a Prettier plugin with sorting parsers and validated options
 */
export function createSortingPlugin(rules: SortOptions = {}): Plugin {
  const sortingOptions = (format: Options): SortOptions => {
    const policy = format.orderedSortConfigFiles
      ? configurationSortOptions(format.filepath ?? '')
      : undefined

    return {
      ...rules,
      ...policy,
      arrayValues: {
        minValues: format.orderedSortArrays ? 2 : Number.MAX_SAFE_INTEGER,
        ...rules.arrayValues,
        ...policy?.arrayValues,
      },
    }
  }

  const parsers: NonNullable<Plugin['parsers']> = {}

  for (const name of ['json', 'jsonc', 'json5', 'json-stringify'] as const) {
    const original = jsonParsers[name] as Parser<JsonNode>
    parsers[name] = {
      ...original,
      async parse(text, format) {
        const ast = await original.parse(text, format)
        if (
          format.orderedSort === false ||
          !ast.node ||
          ast.comments?.some(comment => /\bprettier-ignore\b/.test(comment.value))
        ) {
          return ast
        }

        if (/(?:^|[/\\])package\.json$/.test(format.filepath ?? '')) {
          if (format.orderedSortPackageJson !== false) {
            const value = sortPackageJson(jsonValue(ast.node), {
              sortOrder: format.packageSortOrder,
            })
            applyPackageOrder(ast.node, value)
          }
        } else {
          sortJsonNode(ast.node, sortingOptions(format))
        }
        return ast
      },
    }
  }

  const preprocess = (
    parser: Parser,
    sort: (text: string, rules: SortOptions) => string,
  ): Parser => ({
    ...parser,
    preprocess(text, format) {
      // Conservatively preserve documents with explicit ignore directives.
      if (
        format.orderedSort === false ||
        /^[ \t]*#\s*prettier-ignore\b/m.test(text) ||
        /<!--\s*prettier-ignore\b/.test(text)
      ) {
        return text
      }

      return sort(text, sortingOptions(format))
    },
  })

  parsers['yaml'] = preprocess(yamlParsers['yaml'], sortYamlString)

  for (const name of ['markdown', 'mdx'] as const) {
    parsers[name] = preprocess(markdownParsers[name], sortMarkdownFrontmatter)
  }

  return { options, parsers }
}

const plugin = createSortingPlugin()

export const parsers = plugin.parsers

export default plugin
