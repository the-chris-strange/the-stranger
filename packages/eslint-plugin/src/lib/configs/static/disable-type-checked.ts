import tseslint from 'typescript-eslint'

import type { ConfigWithExtends } from '../../extend-config.js'

import { namer } from '../../namer.js'

export const disableTypeCheckedConfig = [
  {
    name: namer('disable-type-checked'),
    rules: { ...tseslint.configs.disableTypeChecked.rules },
  },
] satisfies ConfigWithExtends[]
