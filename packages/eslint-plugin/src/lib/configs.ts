import {
  type Options,
  configure,
  disableTypeCheckedConfig,
} from '@the-stranger/eslint-config'

import { disableExcept } from './utils/options.js'

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
