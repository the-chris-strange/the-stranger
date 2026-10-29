# Ordered

Sort JSON, YAML, and Markdown frontmatter with configurable key and array ordering.

## Installation

Requires Node.js 24. The package exports an ESM JavaScript API with TypeScript declarations. Use [Chaotic](../chaotic/README.md) for a command-line interface or the [Prettier plugin](../prettier-plugin/README.md) to sort while formatting.

```bash
yarn add @the-stranger/ordered
```

## Usage

```typescript
import { sortJsonString, sortMarkdownFrontmatter, sortValue, sortYamlString } from '@the-stranger/ordered'

const json = sortJsonString('{"b":1,"a":2}')
const yaml = sortYamlString('b: 1\na: 2\n')
const markdown = sortMarkdownFrontmatter('---\nz: 1\na: 2\n---\n# Notes\n')
const values = sortValue(['item10', 'item2'], {
  arrayValues: { sortType: 'natural' },
})
```

`sortValue` recursively sorts parsed JSON-like objects and arrays without mutating the input. `sortJsonValue` and `sortYamlValue` expose the same operation. `sortJsonString` parses JSON and emits it with two-space indentation by default; its `indent` option accepts a number or string. Invalid JSON throws, and duplicate JSON keys follow `JSON.parse` semantics: the last value wins. Integer-like object keys follow JavaScript's numeric enumeration order, even with a descending or named key order.

`sortYamlString` sorts YAML nodes while retaining comments, tags, anchors, and flow/block style. Each document in a YAML stream is sorted independently, retaining document markers and directives. It may normalize whitespace. Duplicate mapping keys throw. Anchor declarations remain before aliases, which can take precedence over the requested sort order. Complex mapping keys are compared through their JSON representation; custom tags and schemas are not specifically supported. `allowLineSeparatedGroups` is accepted but has no effect.

`sortMarkdownFrontmatter` sorts YAML inside an opening `---` frontmatter block, leaving the Markdown body unchanged. Documents without recognized frontmatter, without a closing fence, or with invalid YAML are returned unchanged.

## Configuration

Object keys and array values default to ascending, case-sensitive locale comparison (`sortType: 'locale'`). Collections with fewer than two entries retain their order, while nested values are still visited. Set `order: 'desc'`, `caseSensitive: false`, `sortType`, `minKeys`, or `minValues` in the relevant section to change these defaults.

| `sortType`           | String comparison                                                          |
| -------------------- | -------------------------------------------------------------------------- |
| `'locale'` (default) | `Intl.Collator` using the runtime's default locale.                        |
| `'natural'`          | Locale comparison with numeric segments, so `item2` comes before `item10`. |
| `'lexical'`          | UTF-16 code-unit order, independent of locale.                             |

The same `sortType` option applies to object keys, array values, path overrides, named-key entries, and comparator factories. Sorting direction and case sensitivity apply to every mode. Unsupported sort types throw. The `SortType` TypeScript type is exported.

**Migration:** replace `natural: true` with `sortType: 'natural'`, `lexical: true` with `sortType: 'lexical'`, and `natural: false` with `sortType: 'locale'` (or omit it). The boolean `natural` and `lexical` options have been removed. This also applies to Chaotic configuration files and Prettier's `createSortingPlugin` rules.

```typescript
import { sortJsonString, type SortOptions } from '@the-stranger/ordered'

const options: SortOptions = {
  objectKeys: {
    overrides: [
      { pathPattern: '', order: ['name', 'version', 'description'] },
      { pathPattern: 'dependencies', sortType: 'natural' },
    ],
  },
  arrayValues: {
    overrides: [{ pathPattern: 'users', keys: ['id', 'name'] }],
  },
}

const sorted = sortJsonString('{"users":[{"id":2},{"id":1}],"version":"1.0.0","name":"example"}', options)
```

Overrides apply in declaration order; later matching settings take precedence. Paths use dotted properties and bracketed indices:

| Pattern          | Meaning                           |
| ---------------- | --------------------------------- |
| `''`             | Root value                        |
| `dependencies.*` | Direct children of `dependencies` |
| `users[*]`       | Elements of `users`               |
| `users[0].name`  | A specific element's property     |
| `**`             | Every path                        |

Named key lists are available in object-key overrides. Listed names come first; remaining keys use the comparator settings. Entries may also be objects such as `{ key: 'name', sortType: 'natural' }`: these pin the key and update the comparator for unlisted keys. Later entries override comparator settings they explicitly supply.

Arrays of objects use `key` or `keys` to compare property values. `keys` selects the first present property on each object, rather than comparing multiple fields in sequence. Without either option, objects are compared using serialized values; `sortObjectKeysBeforeSerialize` defaults to `true`. With `serialize: false` and no comparison key, objects keep their relative order. Mixed arrays group scalars before objects in ascending order and after objects in descending order. Comparison ties preserve input order. The locale and natural modes use `Intl.Collator` with the runtime's default locale. JSON values and YAML nodes share array comparison logic; YAML anchor dependencies are enforced after ordering.

The package also exports comparator factories (`makeStringComparator`, `makeValueComparator`), path helpers (`matchesPattern`, `pathToString`), option-resolution helpers, and their TypeScript types.

## Package.json

Use `sortPackageJson` for manifest-specific ordering instead of generic recursive sorting. It accepts parsed data and returns the same TypeScript type without mutating the input; strings are returned unchanged, so parse JSON before calling it.

```typescript
import { packageJsonSortOrder, sortPackageJson } from '@the-stranger/ordered'

const manifest = sortPackageJson(
  { scripts: { test: 'vitest', pretest: 'build' }, version: '1.0.0', name: 'example' },
  { cwd: process.cwd(), sortOrder: ['name', 'version', 'scripts'] },
)

// Readonly default priorities, available for composing your own order.
const defaultOrder = packageJsonSortOrder
```

The manifest API is also available from `@the-stranger/ordered/package-json` for consumers that only need package sorting.

The default policy follows `sort-package-json` 4 field conventions: known fields come first, then unknown public fields, then fields beginning with `_`. Custom `sortOrder` priorities precede the default list. Dependencies and supported configuration records receive their field-specific ordering; npm lifecycle scripts keep `pre` and `post` scripts around their base script.

Ordinary arrays and unknown nested objects retain their order. Designated manifest lists may be deduplicated or sorted: `keywords` and `files` are deduplicated without reordering, while bundled dependency lists are deduplicated and sorted. Export condition order is preserved with `default` last, and export fallback arrays retain their order. Package-manager declarations take precedence when choosing dependency comparison; otherwise `cwd` supplies the directory used to detect Yarn or pnpm files and defaults to the process working directory.

## Development

From the workspace root:

```bash
yarn nx build ordered
yarn nx test ordered
yarn nx lint ordered
yarn nx typecheck ordered
```

### Matching ESLint data policies

Set `sortType: 'lexical'` in `objectKeys`, `arrayValues`, or an override to compare strings by UTF-16 code units instead of locale collation. `caseSensitive` and `order` still apply. Array options accept `priority: ['.env?']` to pin specific string values before the sorted remainder without deduplicating them.

Override `pathPattern` values can also be `RegExp` objects. Expressions match ESLint-style paths: identifier properties use dots, other names use JSON-quoted brackets, and array indices use numeric brackets (for example, `jobs["build-test"].steps[0]`); use anchors when a complete match is needed. Global and sticky expression state is ignored. String patterns retain their existing wildcard behavior. Regular expressions require a JavaScript or TypeScript configuration rather than JSON.

Set `objectKeys.preserveUnknownKeys: true` (or use it in an override) to sort only keys listed in a named `order` by moving inverted entries after their successors, retaining the relative order of unlisted keys. `sortObjectItems` applies the same resolved object-key policy to entries or syntax nodes without mutating the input.
