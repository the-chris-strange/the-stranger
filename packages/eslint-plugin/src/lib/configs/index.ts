import { extendConfig } from '../extend-config.js'
import astro from './astro.js'
import cypress from './cypress.js'
import jest from './jest.js'
import jsdoc from './jsdoc.js'
import jsonc from './jsonc.js'
import n from './n.js'
import perfectionist from './perfectionist.js'
import promise from './promise.js'
import react from './react.js'
import regexp from './regexp.js'
import toml from './toml.js'
import ts from './typescript-eslint.js'
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

const extendedConfigs = Object.fromEntries(
  Object.entries(standardConfigs).map(([key, config]) => [key, extendConfig(config)]),
)

export const configs = {
  ...extendedConfigs,
  all: extendConfig(
    ...Object.values(standardConfigs),
    jest,
    toml,
    vitest,
    astro,
    cypress,
    react,
  ),
  astro,
  base: extendConfig(),
  cypress,
  jest,
  react,
  standard: extendConfig(vitest, ...Object.values(standardConfigs)),
  toml,
  vitest,
}
