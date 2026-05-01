import { type Options, configure } from '@the-stranger/eslint-config'

import { disableTypeCheckedConfig } from './disable-type-checked.js'
import { disableExcept } from './utils/options.js'

const recommendedSourceOptions = {
  agentSkills: true,
  js: true,
  jsdoc: true,
  node: true,
  promise: true,
  react: false,
  regexp: true,
  sort: true,
  ts: { strict: false, typeChecked: true },
  unicorn: true,
} satisfies Options['source']

const recommendedReactOptions = {
  ...recommendedSourceOptions,
  react: {
    astro: true,
    typeChecked: true,
    typescript: true,
  },
} satisfies Options['source']

const recommendedOptions = {
  json: { sort: true },
  nx: true,
  source: recommendedSourceOptions,
  tests: { unitTestRunner: 'vitest' },
  yaml: { sort: true },
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
    source: recommendedReactOptions,
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
