// Field policies adapted from sort-package-json (MIT, Copyright (c) 2015 Keith Cirkel).
// See ../docs/THIRD_PARTY_NOTICES.md. Object construction preserves own __proto__ keys.
import { existsSync } from 'node:fs'
import { join } from 'node:path'

import gitHooks from 'git-hooks-list'
import { compare, minVersion } from 'semver'

/**
 * Options for sorting parsed package.json data.
 */
export interface PackageJsonSortOptions {
  /**
   * Directory used to detect Yarn or pnpm files when the manifest does not select a manager.
   */
  cwd?: string
  /**
   * Fields to place before the default package.json field order.
   */
  sortOrder?: readonly string[]
}

function array(value: unknown, transform: Transform): unknown {
  return Array.isArray(value) ? value.map(transform) : value
}

function compareIdent(a: string, b: string): number {
  return lexicographic(packageName(a), packageName(b))
}

function hasSequentialScript(original: RecordValue): boolean {
  const dependencies = original['devDependencies']
  if (
    !isRecord(dependencies) ||
    ['npm-run-all', 'npm-run-all2'].every(name => !Object.hasOwn(dependencies, name))
  ) {
    return false
  }

  const sequentialRunner =
    /(?<=^|[\s&;<>|(])(?:run-s|npm-run-all2? .*(?:--sequential|--serial|-s))(?=$|[\s&;<>|)])/

  return ['scripts', 'betterScripts'].some(field => {
    const scripts = original[field]
    return (
      isRecord(scripts) &&
      Object.values(scripts).some(
        command =>
          typeof command === 'string' &&
          command.includes('*') &&
          sequentialRunner.test(command),
      )
    )
  })
}

function isRecord(value: unknown): value is RecordValue {
  if (value !== null && typeof value === 'object') {
    const prototype: object | null = Object.getPrototypeOf(value)
    return (
      (prototype === null ||
        prototype === Object.prototype ||
        Object.getPrototypeOf(prototype) === null) &&
      !(Symbol.toStringTag in value) &&
      !(Symbol.iterator in value)
    )
  }

  return false
}

function lexicographic(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

function mapValues(value: unknown, transform: Transform): unknown {
  return isRecord(value)
    ? Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, transform(item)]),
      )
    : value
}

function npmDependencies({ cwd, original }: Context): boolean {
  if (typeof original['packageManager'] === 'string') {
    return original['packageManager'].startsWith('npm@')
  }

  const devEngines = original['devEngines']
  const manager = isRecord(devEngines) ? devEngines['packageManager'] : undefined
  if (isRecord(manager) && manager['name']) {
    return manager['name'] === 'npm'
  }

  if (original['pnpm']) {
    return false
  }

  const engines = original['engines']
  if (isRecord(engines) && engines['npm']) {
    return true
  }

  return [
    'yarn.lock',
    '.yarn/',
    '.yarnrc.yml',
    'pnpm-lock.yaml',
    'pnpm-workspace.yaml',
  ].every(file => !existsSync(join(cwd, file)))
}

function packageName(ident: string): string {
  const index = ident.indexOf('@', ident.startsWith('@') ? 1 : 0)
  return index === -1 ? ident : ident.slice(0, index)
}

function property(value: unknown, key: string, transform: Transform): unknown {
  return isRecord(value) && Object.hasOwn(value, key)
    ? { ...value, [key]: transform(value[key]) }
    : value
}

function scriptNames(keys: string[], prefix = ''): string[] {
  const groups = new Map<string, string[]>()

  for (const key of keys) {
    const offset = prefix ? prefix.length + 1 : 0
    const colon = key.slice(offset).indexOf(':')
    const group = colon > 0 ? key.slice(0, offset + colon) : key
    const children = groups.get(group) ?? []
    children.push(key)
    groups.set(group, children)
  }

  return [...groups.keys()].sort(lexicographic).flatMap(group => {
    const children = groups.get(group)!
    if (
      children.length > 1 &&
      children.some(key => key !== group && key.startsWith(`${group}:`))
    ) {
      return [
        ...children
          .filter(key => key === group || !key.startsWith(`${group}:`))
          .sort(lexicographic),
        ...scriptNames(
          children.filter(key => key.startsWith(`${group}:`)),
          group,
        ),
      ]
    }

    return children.sort(lexicographic)
  })
}

function sortDependencies(value: unknown, context: Context): unknown {
  if (!isRecord(value) || Object.keys(value).length < 2) {
    return value
  }

  return sortRecord(
    value,
    npmDependencies(context) ? (a, b) => a.localeCompare(b, 'en') : undefined,
  )
}

function sortEslint(value: unknown): unknown {
  const eslintKeys = [
    'files',
    'excludedFiles',
    'env',
    'parser',
    'parserOptions',
    'settings',
    'plugins',
    'extends',
    'rules',
    'overrides',
    'globals',
    'processor',
    'noInlineConfig',
    'reportUnusedDisableDirectives',
  ]
  value = sortRecord(value, eslintKeys)
  for (const key of ['env', 'globals', 'parserOptions', 'settings'])
    value = property(value, key, sortRecord)
  value = property(value, 'overrides', overrides => array(overrides, sortEslint))
  return property(value, 'rules', rules =>
    sortRecord(
      rules,
      (a, b) => a.split('/').length - b.split('/').length || a.localeCompare(b),
    ),
  )
}

function sortExports(value: unknown): unknown {
  if (isRecord(value)) {
    const keys = Object.keys(value)
    return Object.fromEntries(
      [
        ...keys.filter(key => key.startsWith('.')),
        ...keys.filter(key => !key.startsWith('.') && key !== 'default'),
        ...keys.filter(key => key === 'default'),
      ].map(key => [key, sortExports(value[key])]),
    )
  }

  return value
}

function sortPnpm(value: unknown): unknown {
  const pnpmKeys = [
    'peerDependencyRules',
    'neverBuiltDependencies',
    'onlyBuiltDependencies',
    'onlyBuiltDependenciesFile',
    'allowedDeprecatedVersions',
    'allowNonAppliedPatches',
    'updateConfig',
    'auditConfig',
    'requiredScripts',
    'supportedArchitectures',
    'overrides',
    'patchedDependencies',
    'packageExtensions',
  ]
  return property(sortRecord(value, pnpmKeys, true), 'overrides', overrides =>
    sortRecord(overrides, (a, b) => {
      const first = versionedName(a)
      const second = versionedName(b)
      if (first.name !== second.name) return first.name.localeCompare(second.name, 'en')
      if (!first.range) return -1
      if (!second.range) return 1
      return compare(minVersion(first.range)!, minVersion(second.range)!)
    }),
  )
}

function sortPrettier(value: unknown): unknown {
  if (!isRecord(value)) return value
  return property(
    sortRecord(value, [
      ...Object.keys(value)
        .filter(key => key !== 'overrides')
        .sort(lexicographic),
      'overrides',
    ]),
    'overrides',
    overrides =>
      array(overrides, item => property(sortRecord(item), 'options', sortRecord)),
  )
}

function sortRecord(value: unknown, order?: KeyOrder, deep = false): unknown {
  if (isRecord(value)) {
    const alphabetical = Object.keys(value).sort(
      typeof order === 'function' ? order : lexicographic,
    )
    const ranked = typeof order === 'function' ? [] : (order ?? [])
    const keys = [...new Set([...ranked, ...alphabetical])]
    return Object.fromEntries(
      keys
        .filter(key => Object.hasOwn(value, key))
        .map(key => [key, deep ? sortRecord(value[key], order, true) : value[key]]),
    )
  }

  return value
}

function sortScripts(value: unknown, { original }: Context): unknown {
  if (isRecord(value)) {
    const keys = Object.keys(value)
    const prefixable = new Set<string>()
    const npmScripts = new Set([
      'install',
      'pack',
      'prepare',
      'publish',
      'restart',
      'shrinkwrap',
      'start',
      'stop',
      'test',
      'uninstall',
      'version',
    ])

    let names = keys.map(name => {
      const base = name.replace(/^(?:pre|post)/, '')
      if (!npmScripts.has(base) && !keys.includes(base)) {
        return name
      }

      prefixable.add(base)
      return base
    })
    if (!hasSequentialScript(original)) names = scriptNames(names)
    {
      return sortRecord(
        value,
        names.flatMap(name =>
          prefixable.has(name) ? [`pre${name}`, name, `post${name}`] : [name],
        ),
      )
    }
  }

  return value
}

function sortWireitScript(value: unknown): unknown {
  value = sortRecord(value, ['command', 'dependencies', 'files', 'output'])
  value = property(value, 'dependencies', dependencies =>
    array(dependencies, dependency => sortRecord(dependency, ['script', 'cascade'])),
  )
  value = property(value, 'env', env =>
    sortRecord(mapValues(env, item => sortRecord(item, ['external', 'default']))),
  )
  return property(value, 'service', service =>
    property(sortRecord(service, ['readyWhen']), 'readyWhen', sortRecord),
  )
}

function stringArray(value: unknown, sort = false): unknown {
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string')) {
    return value
  }

  const unique = [...new Set(value as string[])]
  return sort ? unique.sort(lexicographic) : unique
}

function versionedName(specifier: string): { name: string; range?: string } {
  let nameAndVersion = specifier
  for (const match of specifier.matchAll(/>/g)) {
    const before = specifier.slice(0, match.index)
    const after = specifier.slice(match.index + 1)
    // A range can begin with > or contain another comparator after whitespace/||.
    // The parent-selector separator instead precedes another package selector.
    if (
      before.trimEnd().endsWith('@') ||
      (/[\s|]$/.test(before) && /^=?\s*(?:v?\d|[xX*])/.test(after))
    )
      continue
    nameAndVersion = before.trimEnd()
    break
  }
  const index = nameAndVersion.lastIndexOf('@')
  return index <= 0
    ? { name: specifier }
    : { name: nameAndVersion.slice(0, index), range: nameAndVersion.slice(index + 1) }
}

interface Context {
  cwd: string
  original: RecordValue
}

interface Field {
  key: string
  transform?: (value: unknown, context: Context) => unknown
}

type KeyOrder = ((a: string, b: string) => number) | readonly string[]

type RecordValue = Record<string, unknown>

type Transform = (value: unknown) => unknown

const fields: Field[] = [
  { key: '$schema' },
  { key: 'name' },
  { key: 'displayName' },
  { key: 'version' },
  { key: 'stableVersion' },
  { key: 'private' },
  { key: 'description' },
  { key: 'categories', transform: value => stringArray(value) },
  { key: 'keywords', transform: value => stringArray(value) },
  { key: 'homepage' },
  { key: 'bugs', transform: value => sortRecord(value, ['url', 'email']) },
  { key: 'repository', transform: value => sortRecord(value, ['type', 'url']) },
  { key: 'funding', transform: value => sortRecord(value, ['type', 'url']) },
  { key: 'license', transform: value => sortRecord(value, ['type', 'url']) },
  { key: 'qna' },
  { key: 'author', transform: value => sortRecord(value, ['name', 'email', 'url']) },
  {
    key: 'maintainers',
    transform: value =>
      array(value, person => sortRecord(person, ['name', 'email', 'url'])),
  },
  {
    key: 'contributors',
    transform: value =>
      array(value, person => sortRecord(person, ['name', 'email', 'url'])),
  },
  { key: 'publisher' },
  { key: 'sideEffects' },
  { key: 'type' },
  { key: 'imports' },
  { key: 'exports', transform: sortExports },
  { key: 'main' },
  { key: 'svelte' },
  { key: 'umd:main' },
  { key: 'jsdelivr' },
  { key: 'unpkg' },
  { key: 'module' },
  { key: 'source' },
  { key: 'jsnext:main' },
  { key: 'browser' },
  { key: 'react-native' },
  { key: 'types' },
  { key: 'typesVersions' },
  { key: 'typings' },
  { key: 'style' },
  { key: 'example' },
  { key: 'examplestyle' },
  { key: 'assets' },
  { key: 'bin', transform: value => sortRecord(value) },
  { key: 'man' },
  {
    key: 'directories',
    transform: value =>
      sortRecord(value, ['lib', 'bin', 'man', 'doc', 'example', 'test']),
  },
  { key: 'files', transform: value => stringArray(value) },
  {
    key: 'workspaces',
    transform: (value, context) =>
      property(
        property(sortRecord(value, ['packages', 'catalog']), 'packages', packages =>
          stringArray(packages, true),
        ),
        'catalog',
        catalog => sortDependencies(catalog, context),
      ),
  },
  {
    key: 'binary',
    transform: value =>
      sortRecord(value, [
        'module_name',
        'module_path',
        'remote_path',
        'package_name',
        'host',
      ]),
  },
  { key: 'scripts', transform: sortScripts },
  { key: 'betterScripts', transform: sortScripts },
  { key: 'wireit', transform: value => sortRecord(mapValues(value, sortWireitScript)) },
  { key: 'l10n' },
  { key: 'contributes', transform: value => sortRecord(value) },
  { key: 'activationEvents', transform: value => stringArray(value) },
  {
    key: 'husky',
    transform: value => property(value, 'hooks', hooks => sortRecord(hooks, gitHooks)),
  },
  { key: 'simple-git-hooks', transform: value => sortRecord(value, gitHooks) },
  { key: 'pre-commit' },
  { key: 'commitlint', transform: value => sortRecord(value) },
  { key: 'lint-staged' },
  { key: 'nano-staged' },
  { key: 'config', transform: value => sortRecord(value) },
  { key: 'nodemonConfig', transform: value => sortRecord(value) },
  { key: 'browserify', transform: value => sortRecord(value) },
  { key: 'babel', transform: value => sortRecord(value) },
  { key: 'browserslist' },
  { key: 'xo', transform: value => sortRecord(value) },
  { key: 'prettier', transform: sortPrettier },
  { key: 'eslintConfig', transform: sortEslint },
  { key: 'eslintIgnore' },
  { key: 'npmpkgjsonlint', transform: value => sortRecord(value) },
  { key: 'npmPackageJsonLintConfig', transform: value => sortRecord(value) },
  { key: 'npmpackagejsonlint', transform: value => sortRecord(value) },
  { key: 'release', transform: value => sortRecord(value) },
  { key: 'remarkConfig', transform: value => sortRecord(value) },
  { key: 'stylelint' },
  { key: 'ava', transform: value => sortRecord(value) },
  { key: 'jest', transform: value => sortRecord(value) },
  { key: 'jest-junit', transform: value => sortRecord(value) },
  { key: 'jest-stare', transform: value => sortRecord(value) },
  { key: 'mocha', transform: value => sortRecord(value) },
  { key: 'nyc', transform: value => sortRecord(value) },
  { key: 'c8', transform: value => sortRecord(value) },
  { key: 'tap', transform: value => sortRecord(value) },
  { key: 'oclif', transform: value => sortRecord(value, undefined, true) },
  { key: 'resolutions', transform: value => sortRecord(value) },
  { key: 'overrides', transform: sortDependencies },
  { key: 'dependencies', transform: sortDependencies },
  { key: 'devDependencies', transform: sortDependencies },
  {
    key: 'dependenciesMeta',
    transform: value => sortRecord(value, compareIdent, true),
  },
  { key: 'peerDependencies', transform: sortDependencies },
  {
    key: 'peerDependenciesMeta',
    transform: value => sortRecord(value, undefined, true),
  },
  { key: 'optionalDependencies', transform: sortDependencies },
  { key: 'bundledDependencies', transform: value => stringArray(value, true) },
  { key: 'bundleDependencies', transform: value => stringArray(value, true) },
  { key: 'extensionPack', transform: value => stringArray(value, true) },
  { key: 'extensionDependencies', transform: value => stringArray(value, true) },
  { key: 'flat' },
  { key: 'packageManager' },
  { key: 'engines', transform: value => sortRecord(value) },
  { key: 'engineStrict', transform: value => sortRecord(value) },
  {
    key: 'devEngines',
    transform: value =>
      property(value, 'packageManager', manager =>
        sortRecord(manager, ['name', 'version', 'onFail']),
      ),
  },
  { key: 'volta', transform: value => sortRecord(value, ['node', 'npm', 'yarn']) },
  { key: 'languageName' },
  { key: 'os' },
  { key: 'cpu' },
  { key: 'preferGlobal', transform: value => sortRecord(value) },
  { key: 'publishConfig', transform: value => sortRecord(value) },
  { key: 'icon' },
  {
    key: 'badges',
    transform: value =>
      array(value, badge => sortRecord(badge, ['description', 'url', 'href'])),
  },
  { key: 'galleryBanner', transform: value => sortRecord(value) },
  { key: 'preview' },
  { key: 'markdown' },
  { key: 'pnpm', transform: sortPnpm },
]

/** The default package.json field order, before unknown public and private fields. */
export const packageJsonSortOrder: readonly string[] = Object.freeze(
  fields.map(field => field.key),
)

/**
 * Sort parsed package.json data without mutating it or reordering ordinary arrays.
 * @param input - Parsed manifest data; non-object values are returned unchanged.
 * @param options - Custom field priorities and package-manager discovery directory.
 * @returns The sorted manifest, retaining values and ordinary array order.
 */
export function sortPackageJson<T>(input: T, options: PackageJsonSortOptions = {}): T {
  if (!isRecord(input)) return input
  const keys = Object.keys(input)
  const order = [
    ...(options.sortOrder ?? []),
    ...packageJsonSortOrder,
    ...keys.filter(key => !key.startsWith('_')).sort(lexicographic),
    ...keys.filter(key => key.startsWith('_')).sort(lexicographic),
  ]
  let output = sortRecord(input, order) as RecordValue
  const context: Context = { cwd: options.cwd ?? process.cwd(), original: input }
  for (const { key, transform } of fields) {
    if (transform)
      output = property(output, key, value => transform(value, context)) as RecordValue
  }
  return output as T
}
