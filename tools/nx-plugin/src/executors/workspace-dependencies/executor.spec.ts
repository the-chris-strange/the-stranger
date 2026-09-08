import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

import { type ExecutorContext, workspaceRoot } from '@nx/devkit'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { WorkspaceDependenciesSchema } from './schema'

import executor from './executor'
import { readPackageJson, writePackageJson } from './package-json'

vi.mock(import('./get-workspace-dependencies.js'), () => ({
  getWorkspaceDependencies: vi.fn(async function* () {
    await Promise.resolve()
    yield {
      dependencySet: 'dependencies',
      name: 'project-b',
      version: '1.0.0',
    } as const
  }),
}))

describe('inter-project dependency resolver executor', () => {
  const rootDir = join(workspaceRoot, 'tmp/workspace-dependencies-executor')

  const projectNames = { a: 'project-a', b: 'project-b' } as const

  // absolute paths, as would be found in the project graph
  const projectADir = join(rootDir, projectNames.a)
  const projectBDir = join(rootDir, projectNames.b)
  const projectABuildOutput = join(rootDir, 'dist', projectNames.a)
  // relative paths, as would be provided in the context and options
  const projectARoot = relative(workspaceRoot, projectADir)
  const buildOutputPath = relative(workspaceRoot, projectABuildOutput)
  const destinationPath = relative(
    workspaceRoot,
    join(projectABuildOutput, 'package.json'),
  )
  const projectBRoot = relative(workspaceRoot, projectBDir)

  const manifests = {
    destination: join(projectABuildOutput, 'package.json'),
    [projectNames.a]: join(projectADir, 'package.json'),
    [projectNames.b]: join(projectBDir, 'package.json'),
  } as const

  let options: WorkspaceDependenciesSchema
  const context: ExecutorContext = {
    cwd: process.cwd(),
    isVerbose: false,
    nxJsonConfiguration: {},
    projectGraph: {
      dependencies: {},
      nodes: {
        [projectNames.a]: {
          data: {
            root: projectARoot,
            targets: {
              build: { outputs: [`{workspaceRoot}/${buildOutputPath}`] },
            },
          },
          name: projectNames.a,
          type: 'app',
        },
        [projectNames.b]: {
          data: {
            root: projectBRoot,
          },
          name: projectNames.b,
          type: 'lib',
        },
      },
    },
    projectName: projectNames.a,
    projectsConfigurations: {
      projects: {
        [projectNames.a]: {
          root: projectARoot,
        },
        [projectNames.b]: {
          root: projectBRoot,
        },
      },
      version: 2,
    },
    root: workspaceRoot,
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    await rm(rootDir, { force: true, recursive: true })

    const packageJsonAContent = {
      dependencies: {
        [projectNames.b]: 'workspace:^',
      },
      name: projectNames.a,
      version: '0.1.0',
    }

    await writePackageJson(manifests[projectNames.a], packageJsonAContent)

    await writePackageJson(manifests.destination, packageJsonAContent)

    await writePackageJson(manifests[projectNames.b], {
      name: projectNames.b,
      version: '1.0.0',
    })

    options = {
      destination: destinationPath,
      source: projectARoot,
    }
  })

  afterAll(async () => {
    await rm(rootDir, { force: true, recursive: true })
  })

  it('runs successfully', async () => {
    const output = await executor(options, context)
    expect(output.success).toBe(true)
  })

  it('updates a workspace-relative destination manifest', async () => {
    await executor(options, context)

    const destinationManifest = await readPackageJson(manifests.destination)
    expect(destinationManifest.dependencies?.[projectNames.b]).toBe('^1.0.0')
  })

  it('resolves inferred build outputs relative to the workspace root', async () => {
    const output = await executor({ source: projectARoot }, context)
    expect(output.success).toBe(true)

    const destinationManifest = await readPackageJson(manifests.destination)
    expect(destinationManifest.dependencies?.[projectNames.b]).toBe('^1.0.0')
  })

  it('defaults to a ^ prefix for resolved versions', async () => {
    options.resolvedVersionPrefix = undefined
    await executor(options, context)

    const destinationManifest = await readPackageJson(manifests.destination)
    expect(destinationManifest.dependencies?.[projectNames.b]).toBe('^1.0.0')
  })

  it.each(['', '^', '~'] as const)(
    'overrides the version prefix if specified',
    async v => {
      options.resolvedVersionPrefix = v
      await executor(options, context)

      const destinationManifest = await readPackageJson(manifests.destination)
      expect(destinationManifest.dependencies?.[projectNames.b]).toBe(v + '1.0.0')
    },
  )

  it('stages project-local distribution files before resolving dependencies', async () => {
    const stagedPackage = join(rootDir, 'publish', projectNames.a)
    await mkdir(join(projectADir, 'dist'), { recursive: true })
    await mkdir(join(projectADir, 'docs', 'guides'), { recursive: true })
    await writeFile(join(projectADir, 'dist/index.js'), 'export default true\n')
    await writeFile(join(projectADir, 'dist/package.json'), '{}\n')
    await writeFile(join(projectADir, 'README.md'), '# Project A\n')
    await writeFile(join(projectADir, 'docs/guides/usage.md'), '# Usage\n')
    await writeFile(join(projectADir, 'docs/internal.txt'), 'not public\n')
    await writePackageJson(manifests[projectNames.a], {
      dependencies: { [projectNames.b]: 'workspace:^' },
      executors: './executors.json',
      generators: './generators.json',
      name: projectNames.a,
      version: '0.1.0',
    })

    const output = await executor(
      {
        destination: relative(workspaceRoot, stagedPackage),
        source: projectARoot,
        stage: true,
      },
      context,
    )

    expect(output.success).toBe(true)
    await expect(readFile(join(stagedPackage, 'dist/index.js'), 'utf8')).resolves.toBe(
      'export default true\n',
    )
    await expect(readFile(join(stagedPackage, 'README.md'), 'utf8')).resolves.toBe(
      '# Project A\n',
    )
    await expect(
      readFile(join(stagedPackage, 'docs/guides/usage.md'), 'utf8'),
    ).resolves.toBe('# Usage\n')
    await expect(
      readFile(join(stagedPackage, 'dist/package.json'), 'utf8'),
    ).rejects.toThrow()
    await expect(
      readFile(join(stagedPackage, 'docs/internal.txt'), 'utf8'),
    ).rejects.toThrow()
    const stagedManifest = await readPackageJson(stagedPackage)
    expect(stagedManifest.dependencies?.[projectNames.b]).toBe('^1.0.0')
    expect(stagedManifest.executors).toBe('./dist/executors.json')
    expect(stagedManifest.generators).toBe('./dist/generators.json')
    const sourceManifest = await readPackageJson(manifests[projectNames.a])
    expect(sourceManifest.dependencies?.[projectNames.b]).toBe('workspace:^')
  })
})
