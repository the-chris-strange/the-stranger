import { beforeEach, describe, expect, it } from 'vitest'

import type { Tree } from '@nx/devkit'

import type { ErrorClassSchema } from './schema'

import { createTestTree } from '../../test/helpers/create-test-tree'
import { errorClassGenerator } from './generator'

describe('custom error class generator', () => {
  let options: ErrorClassSchema
  let tree: Tree

  beforeEach(() => {
    options = {
      directory: 'packages/package/src/custom-error',
      name: 'a-custom-error',
      skipFormat: true,
    }

    tree = createTestTree()
  })

  it('runs successfully', async () => {
    await errorClassGenerator(tree, options)

    expect(tree.exists(`${options.directory}/a-custom-error.ts`)).toBe(true)
    expect(tree.exists(`${options.directory}/a-custom-error.spec.ts`)).toBe(true)
  })

  it('does not output a test file if given `noTests`', async () => {
    options.skipTests = true
    const testFile = `${options.directory}/a-custom-error.spec.ts`

    await errorClassGenerator(tree, options)

    expect(tree.exists(testFile)).toBe(false)
  })

  it('extends the specified error name', async () => {
    options.extend = 'TypeError'
    const file = `${options.directory}/a-custom-error.ts`

    await errorClassGenerator(tree, options)

    expect(tree.read(file, 'utf8')).toContain('extends TypeError')
  })

  it('emits the default description in a jsdoc comment', async () => {
    const file = `${options.directory}/a-custom-error.ts`

    await errorClassGenerator(tree, options)

    expect(tree.read(file, 'utf8')).toContain('\n * Emit a custom Error.\n')
  })

  it('emits the specified description in a jsdoc comment', async () => {
    options.description = 'A brief description.'
    const file = `${options.directory}/a-custom-error.ts`

    await errorClassGenerator(tree, options)

    expect(tree.read(file, 'utf8')).toContain('\n * A brief description.\n')
  })
})
