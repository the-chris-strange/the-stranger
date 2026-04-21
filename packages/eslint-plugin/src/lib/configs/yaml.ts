import ymlPlugin from 'eslint-plugin-yml'

import type { ConfigOptions } from '../configure.js'
import type { ConfigWithExtends } from '../extend-config.js'

import { namer } from '../namer.js'
import {
  cspellYamlSortConfig,
  githubActionsYamlSortConfig,
  markdownlintYamlSortConfig,
  yarnrcYamlSortConfig,
} from './static/yaml/index.js'

export function configureYaml({ yaml }: ConfigOptions) {
  if (!Object.values(yaml.sort).includes(true)) {
    return []
  }

  const configs = [
    ['cspellConfig', cspellYamlSortConfig],
    ['githubActions', githubActionsYamlSortConfig],
    ['markdownlintConfig', markdownlintYamlSortConfig],
    ['yarnrc', yarnrcYamlSortConfig],
  ] satisfies [keyof ConfigOptions['yaml']['sort'], ConfigWithExtends[]][]

  return configs.reduce<ConfigWithExtends[]>(
    (acc, [key, value]) => {
      if (yaml.sort[key]) {
        acc.push(...value)
      }
      return acc
    },
    [
      {
        extends: [ymlPlugin.configs['flat/standard']],
        files: ['*.{yml,yaml}', '**/*.{yml,yaml}'],
        name: namer('yml/standard'),
      },
    ],
  )
}
