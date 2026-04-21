import { browser, node } from 'globals'

import type { ConfigOptions } from '../configure.js'
import type { ConfigWithExtends } from '../extend-config.js'

import { namer } from '../namer.js'
import { FilePatterns, getFilePatterns } from '../patterns.js'

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
