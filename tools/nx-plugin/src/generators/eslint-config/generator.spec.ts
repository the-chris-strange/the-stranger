import { type Tree, addProjectConfiguration } from '@nx/devkit'
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing'
import { beforeEach, describe, expect, it } from 'vitest'

import { eslintConfigGenerator } from './generator'

describe('internal ESLint config generator', () => {
  let tree: Tree

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace()
  })

  it('generates the root config when no project is provided', async () => {
    await eslintConfigGenerator(tree, { skipFormat: true })

    const content = tree.read('eslint.config.mjs', 'utf8')
    expect(content).toContain('// THIS FILE IS GENERATED. DO NOT EDIT.')
    expect(content).toContain(
      "const { configure } = jiti('@the-stranger/eslint-config')",
    )
    expect(content).toContain('const configureOptions =')
    expect(content).toContain('configureOptions.nx = [')
    expect(content).toContain('String.raw')
    expect(content).toContain('export const JS_FILES')
    expect(content).toContain('export const disableTypeChecked')
  })

  it('customizes configure options in the root config', async () => {
    await eslintConfigGenerator(tree, {
      configureConfigExpressions: [
        "{ name: 'custom/rules', files: ['**/*.custom.js'], rules: {} }",
      ],
      configureOptions: {
        json: false,
        tests: {
          unitTestRunner: 'jest',
        },
      },
      moduleBoundaries: false,
      skipFormat: true,
    })

    const content = tree.read('eslint.config.mjs', 'utf8')
    expect(content).toContain('json: false')
    expect(content).toContain("unitTestRunner: 'jest'")
    expect(content).not.toContain('configureOptions.nx = [')
    expect(content).toContain(
      "{ name: 'custom/rules', files: ['**/*.custom.js'], rules: {} }",
    )
  })

  it('generates a project config for the specified project', async () => {
    addProjectConfiguration(tree, 'test', {
      projectType: 'library',
      root: 'packages/test',
      sourceRoot: 'packages/test/src',
      targets: {},
    })

    await eslintConfigGenerator(tree, { project: 'test', skipFormat: true })

    const content = tree.read('packages/test/eslint.config.mjs', 'utf8')
    expect(content).toContain(
      "import baseConfig, { dependencyChecks } from '../../eslint.config.mjs'",
    )
    expect(content).toContain('dependencyChecks({')
    expect(content).toContain("'{projectRoot}/eslint.config.{ts,js,cjs,mjs}'")
  })

  it('uses explicit dependency check options in project configs', async () => {
    addProjectConfiguration(tree, 'test', {
      projectType: 'library',
      root: 'packages/test',
      sourceRoot: 'packages/test/src',
      targets: {},
    })

    await eslintConfigGenerator(tree, {
      dependencyChecksIgnore: ['generated/**'],
      dependencyChecksRuntime: ['tslib'],
      project: 'test',
      skipFormat: true,
    })

    const content = tree.read('packages/test/eslint.config.mjs', 'utf8')
    expect(content).toContain("'{projectRoot}/generated/**'")
    expect(content).toContain('runtimeHelpers')
    expect(content).toContain("'tslib'")
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
