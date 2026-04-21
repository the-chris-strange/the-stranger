import { configureJson } from './configs/json.js'
import { configureSource } from './configs/source.js'
import { tomlConfig } from './configs/static/toml.js'
import { configureTests } from './configs/tests.js'
import { configureYaml } from './configs/yaml.js'
import { type ConfigWithExtends, extendConfig } from './extend-config.js'

export function configure(options?: Options) {
  const config = resolveOptions(options)
  const configs: ConfigWithExtends[] = [
    ...configureSource(config),
    ...configureTests(config),
    ...configureJson(config),
    ...configureYaml(config),
  ]

  if (config.toml) {
    configs.push(...tomlConfig)
  }

  return extendConfig(...configs)
}

export interface ConfigOptions {
  json: SortOptions<JsonSortOptions>
  source: SourceCodeOptions
  yaml: SortOptions<YamlSortOptions>
  nx?: boolean | ConfigWithExtends[]
  tests?: TestFileOptions
  toml?: boolean
}

export type Options = MakeOptions<Omit<ConfigOptions, 'tests'>, true> &
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

function resolveOptions(options?: Options): ConfigOptions {
  options ??= {}
  const { nx, tests, toml } = options
  const json = resolveJsonOptions(options)
  const yaml = resolveYamlOptions(options)
  const source = resolveSourceCodeOptions(options)
  return { json, nx, source, tests, toml, yaml }
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
    return source?.ts?.[key] ?? key === 'typeChecked'
  }

  return { strict: getValue('strict'), typeChecked: getValue('typeChecked') }
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
      githubActions: getValue('githubActions'),
      markdownlintConfig: getValue('markdownlintConfig'),
      yarnrc: getValue('yarnrc'),
    },
  }
}

interface JavascriptOptions {
  browser: boolean
  node: boolean
}

interface JsonSortOptions {
  nx: boolean
  tsconfig: boolean
  vscode: boolean
}

type MakeOptions<T extends object, R extends boolean = false> = {
  [K in keyof T]?: T[K] extends object
    ? (R extends true ? MakeOptions<T[K], R> : T[K]) | boolean
    : T[K]
}

interface ReactOptions {
  /**
   * Generate configuration for Astro.js files.
   */
  astro: boolean
  typeChecked: boolean
  typescript: boolean
}

type SortOptions<T extends object> = { sort: T }

interface SourceCodeOptions {
  js: JavascriptOptions
  jsdoc: boolean
  node: boolean
  promise: boolean
  react: ReactOptions
  regexp: boolean
  sort: boolean
  ts: TypescriptOptions
  unicorn: boolean
}

interface TestFileOptions {
  disallowedWords?: string[]
  e2eTestRunner?: 'cypress' | 'playwright'
  unitTestRunner?: 'jest' | 'vitest'
}

interface TypescriptOptions {
  strict: boolean
  typeChecked: boolean
}

interface YamlSortOptions {
  cspellConfig: boolean
  githubActions: boolean
  markdownlintConfig: boolean
  yarnrc: boolean
}
