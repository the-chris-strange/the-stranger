import { type ConfigOptions, configure, type Options } from '../configure.js'
import { disableTypeCheckedConfig } from './static/disable-type-checked.js'

function disableExcept<K extends keyof ConfigOptions>(config: Options, ...keys: K[]) {
  return configure(disableOptionsExcept(config, ...keys))
}

function disableOptionsExcept<K extends keyof ConfigOptions>(
  config: Options,
  ...keys: K[]
) {
  const configKeys = [
    'json',
    'source',
    'nx',
    'tests',
    'toml',
    'yaml',
  ] satisfies (keyof ConfigOptions)[]
  const keySet = new Set<string>(keys)
  for (const key of configKeys) {
    if (keySet.has(key)) {
      config[key] ??= true
    } else {
      config[key] = false
    }
  }
  return config
}

const recommendedSourceOptions = {
  js: true,
  jsdoc: true,
  regexp: true,
  sort: true,
  ts: true,
} satisfies Options['source']

const recommendedOptions = {
  json: true,
  nx: true,
  source: recommendedSourceOptions,
  tests: { unitTestRunner: 'vitest' },
  yaml: true,
} satisfies Options

export const configs = {
  'disableTypeChecked': disableTypeCheckedConfig,
  'json': disableExcept({}, 'json'),
  'recommended': configure(recommendedOptions),
  'recommended/astro': configure({
    ...recommendedOptions,
    source: {
      ...recommendedSourceOptions,
      react: { astro: true, typeChecked: true, typescript: true },
    },
  }),
  'recommended/no-type-checked': configure({
    ...recommendedOptions,
    source: { ...recommendedSourceOptions, ts: { strict: false, typeChecked: false } },
  }),
  'recommended/react': configure({
    ...recommendedOptions,
    source: {
      ...recommendedSourceOptions,
      react: { astro: false, typeChecked: true, typescript: true },
    },
  }),
  'recommended/strict': configure({
    ...recommendedOptions,
    source: { ts: { strict: true, typeChecked: true } },
  }),
  'standard': configure(),
  'standard/no-type-checked': configure({
    source: { ts: { strict: false, typeChecked: false } },
  }),
  'standard/strict': configure({
    source: { ts: { strict: true, typeChecked: true } },
  }),
  'tests/jest': disableExcept({ tests: { unitTestRunner: 'jest' } }, 'tests'),
  'tests/vitest': disableExcept({ tests: { unitTestRunner: 'vitest' } }, 'tests'),
  'toml': disableExcept({}, 'toml'),
  'yaml': disableExcept({}, 'yaml'),
} as const
