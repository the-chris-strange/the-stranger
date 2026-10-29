import { beforeEach, describe, expect, it } from 'vitest'

import type { Tree } from '@nx/devkit'

import { createTestTree } from '../../test/utils/create-test-tree'
import { syncVitestConfigsGenerator } from './generator'

describe('sync-vitest-configs generator', () => {
  let tree: Tree

  beforeEach(() => {
    tree = createTestTree()
  })

  it('does nothing when no workspace config exists', async () => {
    await expect(syncVitestConfigsGenerator(tree)).resolves.toBeUndefined()
    expect(tree.exists('vitest.workspace.ts')).toBe(false)
    expect(tree.exists('vitest.config.ts')).toBe(false)
  })

  it.each(['mts', 'ts'])(
    'converts a vitest.workspace.%s file to a project config',
    async extension => {
      const workspacePath = `vitest.workspace.${extension}`
      const configPath = `vitest.config.${extension}`
      tree.write(workspacePath, "export default ['packages/**/vitest.config.ts']")

      const result = await syncVitestConfigsGenerator(tree)

      expect(tree.exists(workspacePath)).toBe(false)
      expect(tree.read(configPath, 'utf8')).toContain(
        "import { defineProject } from 'vitest/config'",
      )
      expect(tree.read(configPath, 'utf8')).toContain('export default defineProject({')
      expect(tree.read(configPath, 'utf8')).toContain(
        "projects: ['packages/**/vitest.config.ts']",
      )
      expect(result).toMatchObject({
        outOfSyncMessage: 'The workspace Vitest configuration is out of sync.',
      })
    },
  )

  it('converts a defineWorkspace export and preserves other imports', async () => {
    tree.write(
      'vitest.workspace.ts',
      `import { defineWorkspace, mergeConfig } from 'vitest/config'

const projects = ['packages/*']

export default defineWorkspace(projects)
`,
    )

    await syncVitestConfigsGenerator(tree)

    const contents = tree.read('vitest.config.ts', 'utf8')
    expect(contents).toContain(
      "import { defineProject, mergeConfig } from 'vitest/config'",
    )
    expect(contents).not.toContain('defineWorkspace')
    expect(contents).toContain("const projects = ['packages/*']")
    expect(contents).toContain('projects: projects')
  })

  it.each(['mts', 'ts', 'js', 'mjs', 'cjs', 'cts'])(
    'preserves a conflicting defineProject root .%s config and workspace',
    async extension => {
      const config =
        "import { defineProject } from 'vitest/config'\nexport default defineProject({ test: { include: ['root.spec.ts'] } })"
      const workspace = "export default ['packages/*/vitest.config.ts']"
      const configPath = `vitest.config.${extension}`
      tree.write(configPath, config)
      tree.write('vitest.workspace.ts', workspace)

      await expect(syncVitestConfigsGenerator(tree)).rejects.toThrow(/already exists/)
      expect(tree.read(configPath, 'utf8')).toBe(config)
      expect(tree.read('vitest.workspace.ts', 'utf8')).toBe(workspace)
    },
  )

  it('preserves both legacy files when their selections conflict', async () => {
    tree.write('vitest.workspace.ts', "export default ['packages/a']")
    tree.write('vitest.workspace.mts', "export default ['packages/b']")
    await expect(syncVitestConfigsGenerator(tree)).rejects.toThrow()
    expect(tree.read('vitest.workspace.ts', 'utf8')).toBe(
      "export default ['packages/a']",
    )
    expect(tree.read('vitest.workspace.mts', 'utf8')).toBe(
      "export default ['packages/b']",
    )
    expect(tree.exists('vitest.config.mts')).toBe(false)
    expect(tree.exists('vitest.config.ts')).toBe(false)
  })

  it('leaves the migrated configuration unchanged on a second run', async () => {
    tree.write('vitest.workspace.ts', "export default ['packages/*']")
    await syncVitestConfigsGenerator(tree)
    const config = tree.read('vitest.config.ts', 'utf8')
    await expect(syncVitestConfigsGenerator(tree)).resolves.toBeUndefined()
    expect(tree.read('vitest.config.ts', 'utf8')).toBe(config)
  })

  it('rejects a conflicting root config', async () => {
    tree.write('vitest.config.ts', 'export default {}')
    tree.write('vitest.workspace.ts', "export default ['packages/*']")

    await expect(syncVitestConfigsGenerator(tree)).rejects.toThrow(/already exists/)
    expect(tree.read('vitest.config.ts', 'utf8')).toBe('export default {}')
    expect(tree.exists('vitest.workspace.ts')).toBe(true)
  })
})
