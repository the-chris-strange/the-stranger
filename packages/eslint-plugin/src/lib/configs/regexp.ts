import re from 'eslint-plugin-regexp'

import type { Linter } from 'eslint'

import { objectNamer } from '../namer.js'

export default [
  objectNamer(re.configs['flat/recommended'], 're-recommended'),
] as Linter.Config[]
