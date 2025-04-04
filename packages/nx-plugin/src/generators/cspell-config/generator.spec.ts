import { addProjectConfiguration, Tree } from '@nx/devkit'
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing'
import { beforeEach, describe, expect, it } from 'vitest'

import { cspellConfigGenerator } from './generator'
import { CspellConfigSchema } from './schema'

describe('cspell-config generator', () => {
  let tree: Tree
  let options: CspellConfigSchema

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace()
    addProjectConfiguration(tree, 'tests', { root: 'packages/tests' })
    addProjectConfiguration(tree, 'more-tests', { root: 'packages/more-tests' })
    addProjectConfiguration(tree, 'another-test', { root: 'packages/another-test' })

    options = { project: 'tests', skipFormat: true }
  })

  it('runs successfully', async () => {
    await cspellConfigGenerator(tree, options)

    expect(tree.exists('packages/tests/cspell.config.yaml')).toBe(true)
  })

  it('does not overwrite existing config files by default', async () => {
    const configPath = 'packages/tests/cspell.config.yaml'
    const content = 'version: "0.2"'
    tree.write(configPath, content)

    await cspellConfigGenerator(tree, options)

    expect(tree.read(configPath, 'utf8')).toBe(content)
  })

  it('overwrites existing config files if `force` option is true', async () => {
    const configPath = 'packages/tests/cspell.config.yaml'
    tree.write(configPath, 'version: "0.2"')

    options.force = true

    await cspellConfigGenerator(tree, options)

    expect(tree.read(configPath, 'utf8')).toBe(
      'version: "0.2"\nimport:\n  - ../../cspell.config.yaml\n',
    )
  })
})
