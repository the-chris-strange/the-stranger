import type { ConfigWithExtends } from '@the-stranger/eslint-utils'

export function resolveOptions(options?: Options): ConfigOptions {
  options ??= {}
  const { nx, tests, toml } = options
  const json = resolveJsonOptions(options)
  const yaml = resolveYamlOptions(options)
  const source = resolveSourceCodeOptions(options)
  return { json, nx, source, tests, toml, yaml }
}

export interface ConfigOptions {
  json: SortOptions<JsonSortOptions>
  source: SourceCodeOptions
  yaml: SortOptions<YamlSortOptions>
  nx?: boolean | ConfigWithExtends[]
  tests?: TestFileOptions
  toml?: boolean
}

export type Options = MakeOptions<Omit<ConfigOptions, 'tests'>> &
  Pick<ConfigOptions, 'tests'>

function resolveJsonOptions({ json }: Options): ConfigOptions['json'] {
  const getValue = (key: keyof ConfigOptions['json']['sort']): boolean => {
    if (typeof json === 'boolean') return json
    if (typeof json?.sort === 'boolean') return json.sort
    return json?.sort?.[key] ?? true
  }

  return {
    sort: {
      nx: getValue('nx'),
      tsconfig: getValue('tsconfig'),
      vscode: getValue('vscode'),
    },
  }
}

function resolveJsOptions({ source }: Options): JavascriptOptions {
  const getValue = (key: keyof JavascriptOptions) => {
    if (typeof source === 'boolean') return source
    if (typeof source?.js === 'boolean') return source.js
    return source?.js?.[key] ?? true
  }

  return { browser: getValue('browser'), node: getValue('node') }
}

function resolveReactOptions({ source }: Options): ReactOptions {
  const getValue = (key: keyof ReactOptions) => {
    if (typeof source === 'object' && source.react) {
      return typeof source.react === 'boolean'
        ? source.react
        : (source.react?.[key] ?? false)
    }
    return false
  }

  return {
    astro: getValue('astro'),
    typeChecked: getValue('typeChecked'),
    typescript: getValue('typescript'),
  }
}

function resolveSourceCodeOptions(options: Options): SourceCodeOptions {
  const getValue = (key: Exclude<keyof SourceCodeOptions, 'js' | 'react' | 'ts'>) => {
    return typeof options.source === 'boolean'
      ? options.source
      : (options.source?.[key] ?? true)
  }

  return {
    agentSkills: getValue('agentSkills'),
    js: resolveJsOptions(options),
    jsdoc: getValue('jsdoc'),
    node: getValue('node'),
    promise: getValue('promise'),
    react: resolveReactOptions(options),
    regexp: getValue('regexp'),
    sort: getValue('sort'),
    ts: resolveTsOptions(options),
    unicorn: getValue('unicorn'),
  }
}

function resolveTsOptions({ source }: Options): TypescriptOptions {
  const getValue = (key: keyof TypescriptOptions) => {
    if (typeof source === 'boolean') return source
    if (typeof source?.ts === 'boolean') return source.ts
    return source?.ts?.[key] ?? (key === 'typeChecked' || key === 'typescript')
  }

  return {
    strict: getValue('strict'),
    typeChecked: getValue('typeChecked'),
    typescript: getValue('typescript'),
  }
}

function resolveYamlOptions({ yaml }: Options): ConfigOptions['yaml'] {
  const getValue = (key: keyof ConfigOptions['yaml']['sort']): boolean => {
    if (typeof yaml === 'boolean') return yaml
    if (typeof yaml?.sort === 'boolean') return yaml.sort
    return yaml?.sort?.[key] ?? true
  }

  return {
    sort: {
      cspellConfig: getValue('cspellConfig'),
      dependabotConfig: getValue('dependabotConfig'),
      githubActions: getValue('githubActions'),
      markdownlintConfig: getValue('markdownlintConfig'),
      yarnrc: getValue('yarnrc'),
    },
  }
}

interface JavascriptOptions {
  /**
   * Include browser globals in the ESLint environment.
   */
  browser: boolean
  /**
   * Include Node.js globals in the ESLint environment.
   */
  node: boolean
}

interface JsonSortOptions {
  /**
   * Sort `nx.json` and `project.json` files.
   */
  nx: boolean
  /**
   * Sort `tsconfig.json` files.
   */
  tsconfig: boolean
  /**
   * Sort vscode configuration files (e.g. `.vscode/settings.json`, `.vscode/launch.json`).
   */
  vscode: boolean
}

type MakeOptions<T extends object> = {
  [K in keyof T]?: (T[K] extends object ? MakeOptions<T[K]> : T[K]) | boolean
}

interface ReactOptions {
  /**
   * Generate configuration for Astro.js files.
   */
  astro: boolean
  /**
   * Include rules that require type information, and configure the TypeScript ESLint parser to provide type information to ESLint.
   */
  typeChecked: boolean
  /**
   * Generate configuration for TypeScript React files (i.e. `.tsx` files).
   */
  typescript: boolean
}

type SortOptions<T extends object> = { sort: T }

interface SourceCodeOptions {
  /**
   * Generate configuration for files in agent skills.
   */
  agentSkills: boolean
  /**
   * Options for configuring globals and rules for JavaScript files (i.e. `.js` and `.jsx` files).
   */
  js: JavascriptOptions
  /**
   * Include rules for JSDoc comments.
   * @see https://github.com/gajus/eslint-plugin-jsdoc
   */
  jsdoc: boolean
  /**
   * Include configuration for Node.js environments.
   */
  node: boolean
  /**
   * Include rules for working with Promises.
   * @see https://github.com/eslint-community/eslint-plugin-promise
   */
  promise: boolean
  /**
   * Configure linting for React files.
   */
  react: ReactOptions
  /**
   * Include rules for working with regular expressions.
   * @see https://ota-meshi.github.io/eslint-plugin-regexp
   */
  regexp: boolean
  /**
   * Include configuration for sorting source code.
   * @see https://perfectionist.dev
   */
  sort: boolean
  /**
   * Configure linting for TypeScript files.
   */
  ts: TypescriptOptions
  /**
   * Include rules from {@link https://github.com/sindresorhus/eslint-plugin-unicorn}
   */
  unicorn: boolean
}

interface TestFileOptions {
  /**
   * Disallow specific words in test titles.
   */
  disallowedWords?: string[]
  /**
   * Include rules for the specified e2e test runner.
   */
  e2eTestRunner?: 'cypress' | 'playwright'
  /**
   * Include rules for the specified unit test runner.
   */
  unitTestRunner?: 'jest' | 'vitest'
}

interface TypescriptOptions {
  /**
   * Enable a more strict set of rules for TypeScript files.
   */
  strict: boolean
  /**
   * Enable rules that require type information, and configure the TypeScript ESLint parser to provide type information to ESLint. If {@link typescript} is `false`, this option has no effect.
   */
  typeChecked: boolean
  /**
   * Generate configuration for TypeScript files (i.e. `.ts` and `.tsx` files). If `false`, all other TypeScript-related options are ignored.
   */
  typescript: boolean
}

interface YamlSortOptions {
  /**
   * Sort `cspell.config.yaml` files.
   */
  cspellConfig: boolean
  /**
   * Special sorting rules for `.github/dependabot.yml`.
   */
  dependabotConfig: boolean
  /**
   * Sort github actions files in `.github/workflows`.
   */
  githubActions: boolean
  /**
   * Special sorting rules for `.markdownlint-cli2.yaml`.
   */
  markdownlintConfig: boolean
  yarnrc: boolean
}
