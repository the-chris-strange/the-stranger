import { Tree } from '@nx/devkit'
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing'
import { beforeEach, describe, expect, it } from 'vitest'

import { FILE_EXTENSIONS, findFileExtension } from './file-extensions'
import { ESLintConfigSchema } from './schema'

describe('findFileExtension', () => {
  let tree: Tree
  let options: ESLintConfigSchema

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace()
    options = { project: 'test' }
  })

  it('returns the value of the `fileExtension` option, if provided', () => {
    options.fileExtension = 'mjs'
    expect(findFileExtension(options, '')).toBe('mjs')
  })

  it.each(FILE_EXTENSIONS.map(e => [e, `eslint.config.${e}`]))(
    'returns %s if baseConfig is %s',
    (ext, baseConfig) => {
      expect(findFileExtension(options, baseConfig)).toBe(ext)
    },
  )

  it('throws if given a baseConfig with an invalid file extension', () => {
    expect(() => {
      findFileExtension(options, 'eslint.config.cs')
    }).toThrow()
  })
})
