import {
  type ConfigWithExtends,
  FilePatterns,
  getFilePatterns,
} from '@the-stranger/eslint-utils'
import globals from 'globals'

import type { ConfigOptions } from './options.js'

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
          ...(js.browser ? globals.browser : {}),
          ...(js.node ? globals.node : {}),
        },
      },
      name: namer('javascript/base'),
    },
  ]
}
