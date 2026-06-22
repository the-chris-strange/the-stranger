import { namer } from '@the-stranger/eslint-utils'
import tseslint from 'typescript-eslint'

import type { ConfigWithExtends } from '@the-stranger/eslint-utils'

export const disableTypeCheckedConfig = [
  {
    name: namer('disable-type-checked'),
    rules: tseslint.configs.disableTypeChecked.rules,
  },
] satisfies ConfigWithExtends[]
