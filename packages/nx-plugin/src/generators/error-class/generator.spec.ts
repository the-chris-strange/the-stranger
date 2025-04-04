import { Tree } from '@nx/devkit'
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing'
import { beforeEach, describe, expect, it } from 'vitest'

import { errorClassGenerator } from './generator'
import { ErrorClassSchema } from './schema'

describe('custom error class generator', () => {
  let tree: Tree
  const options: ErrorClassSchema = {
    directory: 'packages/package/src/custom-error',
    name: 'a-custom-error',
    skipFormat: true,
  }

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace()
  })

  it('runs successfully', async () => {
    await errorClassGenerator(tree, options)
    expect(tree.exists(`${options.directory}/a-custom-error.ts`)).toBe(true)
    expect(tree.exists(`${options.directory}/a-custom-error.spec.ts`)).toBe(true)
  })

  it('does not output a test file if given `noTests`', async () => {
    await errorClassGenerator(tree, { ...options, skipTests: true })
    const testFile = `${options.directory}/a-custom-error.spec.ts`
    expect(tree.exists(testFile)).toBe(false)
  })

  it('extends the specified error name', async () => {
    await errorClassGenerator(tree, { ...options, extend: 'TypeError' })
    const file = `${options.directory}/a-custom-error.ts`
    expect(tree.read(file, 'utf8')).toContain('extends TypeError')
  })

  it('emits the default description in a jsdoc comment', async () => {
    await errorClassGenerator(tree, options)
    const file = `${options.directory}/a-custom-error.ts`
    expect(tree.read(file, 'utf8')).toContain('\n * Emit a custom Error.\n')
  })

  it('emits the specified description in a jsdoc comment', async () => {
    await errorClassGenerator(tree, {
      ...options,
      description: 'A brief description.',
    })
    const file = `${options.directory}/a-custom-error.ts`
    expect(tree.read(file, 'utf8')).toContain('\n * A brief description.\n')
  })
})
