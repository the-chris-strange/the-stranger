import {
  type ConfigWithExtends,
  FilePatterns,
  getFilePatterns,
} from '@the-stranger/eslint-utils'
import { browser, node } from 'globals'

import type { ConfigOptions } from './config-options.js'

import { namer } from './namer.js'

export function configureJs({ js }: ConfigOptions['source']): ConfigWithExtends[] {
  if (!Object.values(js).includes(true)) {
    return []
  }

  return [
    {
      files: getFilePatterns(FilePatterns.js),
      languageOptions: {
        globals: {
          ...(js.browser ? browser : {}),
          ...(js.node ? node : {}),
        },
      },
      name: namer('javascript/base'),
    },
  ]
}
