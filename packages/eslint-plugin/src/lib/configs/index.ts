import { extendConfig, type InfiniteConfigArray } from '../extend-config.js'
import astro from './astro.js'
import cypress from './cypress.js'
import jest from './jest.js'
import jsdoc from './jsdoc.js'
import jsonc from './jsonc.js'
import n from './n.js'
import perfectionist from './perfectionist.js'
import promise from './promise.js'
import react, { reactTypeChecked } from './react.js'
import regexp from './regexp.js'
import toml from './toml.js'
import ts, { typeChecked, typeCheckedStrict } from './typescript-eslint.js'
import unicorn from './unicorn.js'
import vitest from './vitest.js'
import yml from './yml.js'

const standardConfigs = {
  jsdoc,
  jsonc,
  n,
  perfectionist,
  promise,
  regexp,
  ts,
  unicorn,
  yml,
}

const allConfigs = {
  ...standardConfigs,
  astro,
  cypress,
  jest,
  react,
  reactTypeChecked,
  toml,
  typeChecked,
  typeCheckedStrict,
  vitest,
}

export const configs = {
  ...allConfigs,
  all: extendConfig(...Object.values(allConfigs)),
  base: extendConfig(),
  standard: extendConfig(vitest, ...Object.values(standardConfigs)),
}

export type Configs = { [K in keyof typeof configs]: InfiniteConfigArray }
