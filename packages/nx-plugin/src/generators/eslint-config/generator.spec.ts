import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Tree } from '@nx/devkit'

import { createTestTree } from '../../test/utils/create-test-tree'
import { eslintConfigGenerator } from './generator'

vi.mock(import('../../lib/add-dependencies.ts'))

describe('eslint config generator', () => {
  let tree: Tree

  beforeEach(() => {
    tree = createTestTree('test')
  })

  afterAll(() => {
    vi.resetAllMocks()
    vi.resetModules()
  })

  it('generates a workspace config when no project is provided', async () => {
    tree.write('eslint.config.cjs', 'module.exports = []')

    await eslintConfigGenerator(tree, {
      force: true,
      skipDependencies: true,
      skipFormat: true,
    })

    expect(tree.exists('eslint.config.mjs')).toBe(true)
    expect(tree.exists('eslint.config.cjs')).toBe(false)
    expect(tree.read('eslint.config.mjs', 'utf8')).toContain(
      "import { configure } from '@the-stranger/eslint-config'",
    )
  })

  it('generates a project config when a project is provided', async () => {
    await eslintConfigGenerator(tree, {
      force: true,
      project: 'test',
      skipDependencies: true,
      skipFormat: true,
    })

    const config = tree.read('packages/test/eslint.config.mjs', 'utf8')

    expect(config).toContain(
      "import { dependencyChecks } from '@the-stranger/eslint-config/nx'",
    )
    expect(config).toContain("import baseConfig from '../../eslint.config.mjs'")
    expect(config).toContain('dependencyChecks(dependencyChecksOptions)')
    expect(config).toContain('"checkVersionMismatches": false')
  })

  it('supports explicit workspace config type even when a project is provided', async () => {
    await eslintConfigGenerator(tree, {
      configType: 'workspace',
      force: true,
      project: 'test',
      skipDependencies: true,
      skipFormat: true,
    })

    expect(tree.exists('eslint.config.mjs')).toBe(true)
    expect(tree.exists('packages/test/eslint.config.mjs')).toBe(false)
  })

  it('serializes configure options and additional configs in workspace configs', async () => {
    const additionalConfigs = [
      "{ name: 'custom/rules', files: ['**/*.custom.js'], rules: {} }",
      { files: ['**/*.generated.js'], rules: { semi: 'off' } },
    ]

    await eslintConfigGenerator(tree, {
      additionalConfigs,
      configureOptions: {
        json: false,
        tests: {
          unitTestRunner: 'jest',
        },
      },
      force: true,
      skipDependencies: true,
      skipFormat: true,
    })

    const config = tree.read('eslint.config.mjs', 'utf8')

    expect(config).toContain('"json": false')
    expect(config).toContain('"unitTestRunner": "jest"')
    expect(config).toContain(additionalConfigs[0])
    expect(config).toContain('"**/*.generated.js"')
  })

  it('uses extend as the project base config when provided', async () => {
    await eslintConfigGenerator(tree, {
      extend: '../../eslint.base.config.mjs',
      force: true,
      project: 'test',
      skipDependencies: true,
      skipFormat: true,
    })

    expect(tree.read('packages/test/eslint.config.mjs', 'utf8')).toContain(
      "import baseConfig from '../../eslint.base.config.mjs'",
    )
  })

  it('throws if project config type is requested without a project', async () => {
    await expect(
      eslintConfigGenerator(tree, {
        configType: 'project',
        skipDependencies: true,
        skipFormat: true,
      }),
    ).rejects.toThrow('Project config generation requires a project name.')
  })

  it('throws if additional configs are provided for a project config', async () => {
    await expect(
      eslintConfigGenerator(tree, {
        additionalConfigs: ['{ rules: {} }'],
        project: 'test',
        skipDependencies: true,
        skipFormat: true,
      }),
    ).rejects.toThrow('additionalConfigs is only supported for workspace configs.')
  })

  it('adds vitest ignored files to project dependency checks when vitest is detected', async () => {
    tree.write('packages/test/vitest.config.mts', '')

    await eslintConfigGenerator(tree, {
      force: true,
      project: 'test',
      skipDependencies: true,
      skipFormat: true,
    })

    expect(tree.read('packages/test/eslint.config.mjs', 'utf8')).toContain(
      '{projectRoot}/vitest.config.{js,ts,mjs,mts}',
    )
  })

  it('does not overwrite an existing config without force', async () => {
    tree.write('eslint.config.mjs', 'export default []')

    await expect(
      eslintConfigGenerator(tree, {
        skipDependencies: true,
        skipFormat: true,
      }),
    ).rejects.toThrow()
    expect(tree.read('eslint.config.mjs', 'utf8')).toBe('export default []')
  })

  it('overwrites an existing config with force', async () => {
    tree.write('eslint.config.mjs', 'export default []')

    await eslintConfigGenerator(tree, {
      force: true,
      skipDependencies: true,
      skipFormat: true,
    })

    expect(tree.read('eslint.config.mjs', 'utf8')).toContain(
      "import { configure } from '@the-stranger/eslint-config'",
    )
  })
})
