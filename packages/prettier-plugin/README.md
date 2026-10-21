# @the-stranger/prettier-plugin

Sort JSON, YAML, and Markdown frontmatter with Ordered while formatting with Prettier.

## Installation

Requires Node.js 24 and Prettier 3.7 or later within major version 3.

```bash
yarn add -D prettier @the-stranger/prettier-plugin
```

## Usage

Use the plugin with your existing Prettier settings:

```bash
yarn prettier --plugin @the-stranger/prettier-plugin --write data.json config.yaml notes.md
```

Or add it to `prettier.config.mjs`:

```javascript
export default {
  plugins: ['@the-stranger/prettier-plugin'],
}
```

The plugin sorts object keys ascending and preserves ordinary array order by default. It supports Prettier's JSON, JSONC, JSON5, JSON-stringify, YAML, Markdown, and MDX parsers. JSON sorting moves original syntax nodes, preserving comments, duplicate keys, and numbers beyond JavaScript's integer precision. YAML sorting supports multiple documents and retains comments, tags, anchors, and aliases; anchor dependencies can take precedence over key order. Markdown and MDX frontmatter are sorted before the normal Prettier body formatter runs.

For `package.json`, the default is Ordered's [manifest policy](../ordered/README.md#packagejson), following `sort-package-json` field conventions. This orders known fields, dependencies, and lifecycle scripts while preserving ordinary arrays, unknown nested objects, export condition precedence, and fallback array order. Designated manifest lists can still be deduplicated or sorted.

Documents containing `prettier-ignore` directives conservatively skip sorting for the whole document. Prettier's normal handling of ignored regions still applies. JavaScript and TypeScript code retain their ordinary Prettier formatting behavior.

## Shared configuration

The package also provides shared styling settings, including this sorting plugin:

```javascript
import config from '@the-stranger/prettier-plugin/config'

export default config
```

The same settings are available as the named `config` export from `@the-stranger/prettier-plugin`.

**Migration:** the package root's default export is now the Prettier plugin. Existing consumers that imported the default as a configuration must switch to the `/config` entry point or the named `config` export.

## Sorting options

Set these options in your Prettier configuration:

| Option                   | Default | Behavior                                                                            |
| ------------------------ | ------- | ----------------------------------------------------------------------------------- |
| `orderedSort`            | `true`  | Enable data and frontmatter sorting.                                                |
| `orderedSortArrays`      | `false` | Sort ordinary arrays as well as object keys.                                        |
| `orderedSortPackageJson` | `true`  | Apply the manifest policy to `package.json`. Disabling it preserves manifest order. |
| `packageSortOrder`       | `[]`    | Prioritize these manifest fields before the default field order.                    |

```javascript
import config from '@the-stranger/prettier-plugin/config'

export default {
  ...config,
  packageSortOrder: ['name', 'version', 'description', 'scripts'],
}
```

For comparison settings and per-path rules, use `createSortingPlugin`. Replace the shared plugin list with your configured instance:

```typescript
import config from '@the-stranger/prettier-plugin/config'
import { createSortingPlugin } from '@the-stranger/prettier-plugin'

export default {
  ...config,
  plugins: [
    createSortingPlugin({
      objectKeys: {
        overrides: [{ pathPattern: '', order: ['name'] }],
      },
      arrayValues: {
        overrides: [{ pathPattern: 'users', key: 'id', natural: true, minValues: 2 }],
      },
    }),
  ],
}
```

The factory accepts Ordered's [`SortOptions`](../ordered/README.md#configuration). Ordinary arrays remain preserved unless you enable `orderedSortArrays` or supply a lower `minValues` threshold in the factory rules. Manifest sorting uses its separate field policy and `packageSortOrder` settings. The package also exports the plugin's `options` and `parsers` as named exports.

## Development

From the workspace root:

```bash
yarn nx build prettier-plugin
yarn nx test prettier-plugin
yarn nx lint prettier-plugin
yarn nx typecheck prettier-plugin
```
