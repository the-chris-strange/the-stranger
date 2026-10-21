# Chaotic

Sort JSON, YAML, and Markdown frontmatter from files or stdin using [Ordered](../ordered/README.md).

## Installation

Requires Node.js 24. The package provides the `chaotic` command and ESM configuration helpers with TypeScript declarations.

```bash
yarn add @the-stranger/chaotic
```

## Usage

```bash
yarn chaotic data.json
yarn chaotic --write config.yaml notes.md
yarn chaotic --check data.json config.yaml
yarn chaotic --format yaml < config.yaml
yarn chaotic --cwd ./project --config-file ./sorting.json data.json
yarn chaotic --no-config --indent 4 data.json
yarn chaotic -- -data.json
```

Sorted output goes to stdout by default. Omit file arguments to read stdin. `.json` files use JSON, `.yaml`/`.yml` files use YAML, and `.md`/`.markdown` files use Markdown frontmatter. Other extensions and stdin default to JSON. JSON file writes preserve whether the input ends with a newline; stdout output always ends with a newline.

| Option            | Behavior                                                            |
| ----------------- | ------------------------------------------------------------------- |
| `-w`, `--write`   | Replace input files with sorted output; requires file arguments.    |
| `-k`, `--check`   | Report every changed file without writing files or sorted output.   |
| `--format`        | Force `json`, `yaml`, or `markdown`.                                |
| `--cwd`           | Resolve relative input and configuration paths from this directory. |
| `--config`        | Enable configuration loading; enabled by default.                   |
| `--no-config`     | Skip configuration loading and use defaults plus CLI options.       |
| `--config-file`   | Require a specific configuration file.                              |
| `--indent`        | Set JSON indentation to an integer from `0` to `10`.                |
| `-h`, `--help`    | Print usage.                                                        |
| `-v`, `--version` | Print the package version.                                          |

Exit codes are `0` for success and `1` for changed files in check mode, invalid options, or input/configuration failures. Check mode compares emitted text, so formatting differences also count as changes. `--check` conflicts with `--write`; `--no-config` conflicts with `--config-file`.

All input files are read and sorted before writes begin. A malformed or missing input prevents every write. Each changed file is then replaced atomically, following symlink targets and preserving file permissions. This is a per-file guarantee: a later replacement failure can leave earlier files updated.

## Configuration

Configuration uses c12 to discover `chaotic.config.*` in the selected working directory and its `.config` directory. It also recognizes `.config/chaotic.*`. Supported formats include JSON, YAML, JavaScript, and TypeScript; JavaScript/TypeScript exports may be objects or functions, including async functions. Discovery does not search parent directories or the input file's directory. One configuration applies to the entire invocation.

Create `chaotic.config.ts`:

```typescript
import { defineConfig } from '@the-stranger/chaotic'

export default defineConfig({
  indent: 2,
  objectKeys: {
    overrides: [
      { pathPattern: '', order: ['name', 'version', 'description'] },
      { pathPattern: 'dependencies', natural: true },
    ],
  },
  arrayValues: {
    overrides: [{ pathPattern: 'users', key: 'id', natural: true }],
  },
})
```

Options follow Ordered's [`SortJsonStringOptions`](../ordered/README.md#configuration). Object keys and array values sort ascending by default. Configuration `indent` accepts a string, such as `"\t"`, or an integer from `0` to `10`; CLI `--indent` overrides it. Invalid options or failed configuration evaluation stop processing.

Use `extends` to load local files or directories relative to the declaring configuration:

```typescript
import { defineConfig } from '@the-stranger/chaotic'

export default defineConfig({
  extends: ['./base.json', './shared'],
  objectKeys: {
    overrides: [{ pathPattern: '', order: ['name', 'version'] }],
  },
})
```

Extended directories must contain discoverable Chaotic configuration. Every extension is required, remote extensions are disabled, and resolution is limited to 64 configuration sources to bound cycles. Local settings override inherited settings, and arrays replace inherited arrays rather than concatenate them, including override lists and named key orders.

The JavaScript entry point exports `defineConfig` and the `ChaoticConfig` type. Import sorting functions and option types from `@the-stranger/ordered`.

## Development

From the workspace root:

```bash
yarn nx build chaotic
yarn nx test chaotic
yarn nx lint chaotic
yarn nx typecheck chaotic
```
