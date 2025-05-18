import type { Linter } from '@typescript-eslint/utils/ts-eslint'

import { name, version } from '../../package.json'

export const meta: Linter.Plugin['meta'] = { name, version }
