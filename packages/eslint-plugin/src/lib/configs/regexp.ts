import re from 'eslint-plugin-regexp'

import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint'

export default [re.configs['flat/recommended']] satisfies FlatConfig.ConfigArray
