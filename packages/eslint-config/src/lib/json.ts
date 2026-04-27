import jsoncPlugin from 'eslint-plugin-jsonc'

import type { ConfigWithExtends } from '@the-stranger/eslint-utils'

import type { ConfigOptions } from './config-options.js'

import {
  nxJsonSortConfig,
  tsconfigJsonSortConfig,
  vscodeJsonSortConfig,
} from './configs/json/index.js'

export function configureJson({ json }: ConfigOptions) {
  if (!Object.values(json.sort).includes(true)) {
    return []
  }

  const configs = [
    ['nx', nxJsonSortConfig],
    ['tsconfig', tsconfigJsonSortConfig],
    ['vscode', vscodeJsonSortConfig],
  ] satisfies [keyof ConfigOptions['json']['sort'], ConfigWithExtends[]][]

  return configs.reduce<ConfigWithExtends[]>(
    (acc, [key, value]) => {
      if (json.sort[key]) {
        acc.push(...value)
      }
      return acc
    },
    [...jsoncPlugin.configs['base']],
  )
}
