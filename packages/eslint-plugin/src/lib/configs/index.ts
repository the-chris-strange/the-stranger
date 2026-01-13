import type { Linter } from 'eslint'

import { extendConfig } from '../extend-config.js'
import jsdoc from './jsdoc.js'
import jsonc from './jsonc.js'
import n from './n.js'
import perfectionist from './perfectionist.js'
import promise from './promise.js'
import regexp from './regexp.js'
import ts from './typescript-eslint.js'
import unicorn from './unicorn.js'
import yml from './yml.js'

const recommendedConfigs = {
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

interface Configs {
  base: Linter.Config[]
  jsdoc: Linter.Config[]
  jsonc: Linter.Config[]
  n: Linter.Config[]
  perfectionist: Linter.Config[]
  promise: Linter.Config[]
  recommended: Linter.Config[]
  regexp: Linter.Config[]
  ts: Linter.Config[]
  unicorn: Linter.Config[]
  yml: Linter.Config[]
}

export const configs: Configs = {
  ...recommendedConfigs,
  base: extendConfig(),
  recommended: extendConfig(...Object.values(recommendedConfigs)),
}
