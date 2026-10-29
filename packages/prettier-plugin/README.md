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

The package provides shared styling settings without sorting:

```javascript
import config from '@the-stranger/prettier-plugin/config'

export default config
```

The same settings are available as the named `config` export from `@the-stranger/prettier-plugin`. Styling alone preserves data key and array order.

Opt into styling and sorting with the `/sorting-config` entry point (also exported as `sortingConfig`):

```javascript
import sortingConfig from '@the-stranger/prettier-plugin/sorting-config'

export default sortingConfig
```

This preset includes general data and package.json sorting plus the same lexical key orders and designated array sorting as the optional data presets in `@the-stranger/eslint-config`:

- Nx `nx.json`, `project.json`, `executors.json`, and `generators.json`.
- `tsconfig.json` and `tsconfig.*.json`.
- VS Code settings, extensions, launch, and task files under `.vscode`.
- `cspell.config.yaml`, `.github/dependabot.yml`, `.github/workflows/*.yml`, `.markdownlint-cli2.yaml`, and `.yarnrc.yml`.

File policies preserve arrays unless the corresponding ESLint policy sorts them. For example, project tags and CSpell word lists are sorted; task arrays, workflow steps, command arguments, and TypeScript include arrays retain their order. Yarn's `.env?` entry stays first. Fields omitted from Nx plugin and Dependabot root named orders retain their slots. Regex path matching follows ESLint notation, including bracketed job names containing hyphens. Existing ignore directives and YAML anchor dependencies still take precedence.

Use one tool to own these policies: when using this preset, leave ESLint's `json.sort` and `yaml.sort` disabled (their default). JavaScript and TypeScript source sorting remains an ESLint concern.

**Migration:** consumers using `/config` or the named `config` export must switch to `/sorting-config` or `sortingConfig` to retain shared-config sorting. The package root's default export is now the Prettier plugin. Existing consumers that imported the default as a configuration must switch to the `/config` entry point or the named `config` export.

## Sorting options

Set these options in your Prettier configuration:

| Option                   | Default | Behavior                                                                            |
| ------------------------ | ------- | ----------------------------------------------------------------------------------- |
| `orderedSort`            | `true`  | Enable data and frontmatter sorting.                                                |
| `orderedSortConfigFiles` | `false` | Apply the file policies listed above; enabled by `sortingConfig`.                   |
| `orderedSortArrays`      | `false` | Sort ordinary arrays as well as object keys.                                        |
| `orderedSortPackageJson` | `true`  | Apply the manifest policy to `package.json`. Disabling it preserves manifest order. |
| `packageSortOrder`       | `[]`    | Prioritize these manifest fields before the default field order.                    |

```javascript
import sortingConfig from '@the-stranger/prettier-plugin/sorting-config'

export default {
  ...sortingConfig,
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
        overrides: [{ pathPattern: 'users', key: 'id', sortType: 'natural', minValues: 2 }],
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

For comparison rules passed to `createSortingPlugin`, use `sortType: 'locale' | 'natural' | 'lexical'` instead of the former `natural` and `lexical` booleans. The default is `'locale'`; configuration-file policies select `'lexical'` explicitly.
