import { createTestTree } from '@the-stranger/nx-plugin/testing'
import { beforeEach, describe, expect, it } from 'vitest'

import type { Tree } from '@nx/devkit'

import { eslintConfigGenerator } from './generator'

describe('internal ESLint config generator', () => {
  let tree: Tree

  beforeEach(() => {
    tree = createTestTree('project-a')
  })

  it('generates the root config when no project is provided', async () => {
    await eslintConfigGenerator(tree, { skipFormat: true })

    expect(tree.exists('eslint.config.mjs')).toBe(true)
    expect(tree.read('eslint.config.mjs', 'utf8')).toMatchSnapshot()
  })

  it('customizes configure options in the root config', async () => {
    const files = ['**/*.yxz']
    const additionalConfigs = [
      "{ name: 'custom/rules', files: ['**/*.custom.js'], rules: {} }",
      { files, rules: {} },
    ]
    const configureOptions = {
      json: false,
      tests: {
        unitTestRunner: 'jest',
      },
    } as const

    await eslintConfigGenerator(tree, {
      additionalConfigs,
      configureOptions,
      skipFormat: true,
    })

    const config = tree.read('eslint.config.mjs', 'utf8')
    expect(config).toMatchSnapshot()
    expect(config).toContain('"json": false')
    expect(config).toContain('"unitTestRunner": "jest"')
    expect(config).toContain(additionalConfigs[0])
    expect(config).toContain('"**/*.yxz"')
  })

  it('generates a project config for the specified project', async () => {
    await eslintConfigGenerator(tree, { project: 'project-a', skipFormat: true })

    const resultPath = 'packages/project-a/eslint.config.mjs'
    expect(tree.exists(resultPath)).toBe(true)
    expect(tree.read(resultPath, 'utf8')).toMatchSnapshot()
  })

  it('does not overwrite an existing config without force', async () => {
    tree.write('eslint.config.mjs', 'export default []')

    await expect(eslintConfigGenerator(tree, { skipFormat: true })).rejects.toThrow()
    expect(tree.read('eslint.config.mjs', 'utf8')).toBe('export default []')
  })

  it('overwrites an existing config with force', async () => {
    tree.write('eslint.config.mjs', 'export default []')

    await eslintConfigGenerator(tree, { force: true, skipFormat: true })

    expect(tree.read('eslint.config.mjs', 'utf8')).toContain(
      '// THIS FILE IS GENERATED. DO NOT EDIT.',
    )
  })
})
