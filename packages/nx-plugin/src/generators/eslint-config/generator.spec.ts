import { addProjectConfiguration, Tree } from '@nx/devkit'
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { FILE_EXTENSIONS } from './file-extensions'
import { eslintConfigGenerator } from './generator'
import { ESLintConfigSchema } from './schema'

describe('eslint config generator', () => {
  let tree: Tree
  let options: ESLintConfigSchema

  beforeAll(() => {
    vi.mock('../../lib/add-dependencies.ts')
  })

  beforeEach(() => {
    options = { force: true, project: 'test', skipFormat: true }
    tree = createTreeWithEmptyWorkspace()
    addProjectConfiguration(tree, 'test', { root: 'packages/test' })
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  it('runs successfully', async () => {
    tree.write('eslint.config.mjs', '')

    expect(async () => await eslintConfigGenerator(tree, options)).not.toThrow()
  })

  it.each(FILE_EXTENSIONS)('runs successfully with %s extension', async ext => {
    tree.write(`eslint.config.${ext}`, '')
    options.fileExtension = ext

    await eslintConfigGenerator(tree, options)

    expect(tree.exists(`packages/test/eslint.config.${ext}`)).toBe(true)
  })

  it('detects the file extension from the root config', async () => {
    tree.write('eslint.config.cjs', '')
    const spy = vi.spyOn(tree, 'write')

    await eslintConfigGenerator(tree, options)

    expect(spy).toHaveBeenCalledWith(
      'packages/test/eslint.config.cjs',
      expect.any(String),
    )
  })

  it('detects the file extension when given a base config to extend', async () => {
    tree.write('eslint.config.ts', '')
    options.extend = 'eslint.config.ts'
    const spy = vi.spyOn(tree, 'write')

    await eslintConfigGenerator(tree, options)

    expect(spy).toHaveBeenCalledWith(
      'packages/test/eslint.config.ts',
      expect.any(String),
    )
  })

  it('throws if there is no base config to extend', async () => {
    await expect(eslintConfigGenerator(tree, options)).rejects.toThrow()
  })

  it('throws if attempting to extend an invalid base config file', async () => {
    tree.write('eslint.config.rs', '')
    options.extend = 'eslint.config.rs'

    await expect(eslintConfigGenerator(tree, options)).rejects.toThrow()
  })
})
