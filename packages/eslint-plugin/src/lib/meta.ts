import type { ESLint } from 'eslint'

import pkg from '../../package.json' with { type: 'json' }

const { name, version } = pkg
export const meta: ESLint.Plugin['meta'] = { name, version }
