import type { UserConfig } from '@commitlint/types'
import { readdirSync } from 'node:fs'

const pkgs = readdirSync('./packages', 'utf8')

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [0],
    'scope-enum': [2, 'always', pkgs],
  },
} satisfies UserConfig
