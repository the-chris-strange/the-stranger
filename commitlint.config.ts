import { readdirSync } from 'node:fs'

import type { UserConfig } from '@commitlint/types'

const pkgs = readdirSync('./packages', 'utf8').filter(e => e.match(/^[a-z-]+$/))

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [0],
    'scope-enum': [2, 'always', pkgs],
  },
} satisfies UserConfig
