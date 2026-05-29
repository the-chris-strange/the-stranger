import { type Config, defineConfig, globalIgnores } from 'eslint/config'

import type { ConfigWithExtends } from '@the-stranger/eslint-utils'

import { tomlConfig } from './configs/toml.js'
import { configureJson } from './json.js'
import { namer } from './namer.js'
import { configureSource } from './source.js'
import { configureTests } from './tests.js'
import { configureYaml } from './yaml.js'

export function configure(
  options?: Options,
  ...configs: ConfigWithExtends[]
): Config[] {
  const config = resolveOptions(options)
  const configArray: ConfigWithExtends[] = [
    ...configureSource(config),
    ...configureTests(config),
    ...configureJson(config),
    ...configureYaml(config),
  ]

  if (config.toml) {
    configArray.push(...tomlConfig)
  }

  return defineConfig(
    globalIgnores(
      [
        '.cache',
        '.github',
        '.nx',
        '.pnp.*',
        '.yarn',
        'coverage',
        'dist',
        'out-tsc',
        'pnpm-lock.yaml',
        'pnpm-workspace.yaml',
        'tmp',
      ],
      namer('global ignores'),
    ),

    {
      linterOptions: { reportUnusedDisableDirectives: 'error' },
      name: namer('linter options'),
    },

    ...configArray,
    ...configs,
  )
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
  browser: boolean
  node: boolean
}

interface JsonSortOptions {
  nx: boolean
  tsconfig: boolean
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
  typeChecked: boolean
  typescript: boolean
}

type SortOptions<T extends object> = { sort: T }

interface SourceCodeOptions {
  agentSkills: boolean
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
  typescript: boolean
}

interface YamlSortOptions {
  cspellConfig: boolean
  dependabotConfig: boolean
  githubActions: boolean
  markdownlintConfig: boolean
  yarnrc: boolean
}
