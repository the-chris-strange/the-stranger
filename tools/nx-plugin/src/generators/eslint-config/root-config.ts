import { join } from 'node:path'

import { type Tree, generateFiles } from '@nx/devkit'
import { owStrategy } from '@the-stranger/nx-plugin'

import type { NormalizedOptions } from './options'

export function generateRootConfig(tree: Tree, options: NormalizedOptions) {
  const data = {
    additionalConfigs: options.additionalConfigs.map(e =>
      typeof e === 'string' ? e : serialize(e),
    ),
    configureOptions: serialize(options.configureOptions),
  }

  generateFiles(tree, join(__dirname, 'files', 'root'), '.', data, {
    overwriteStrategy: owStrategy(options.force),
  })
}

function serialize(value: object) {
  return JSON.stringify(value, undefined, 2)
}
