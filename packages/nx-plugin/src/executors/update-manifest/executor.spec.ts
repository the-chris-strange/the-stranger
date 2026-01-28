import { rmSync } from 'node:fs'
import { rm } from 'node:fs/promises'

import { ExecutorContext } from '@nx/devkit'
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'

import { writeJson } from '../../lib/json'
import executor from './executor'
import { UpdateManifestSchema } from './schema'

describe('UpdateManifest Executor', () => {
  const cwd = process.cwd()
  const root = `tmp/executor-tests`
  const projectRoot = `${root}/packages/test`
  const pkgJsonPath = `${cwd}/${projectRoot}/package.json`
  let context: ExecutorContext
  let options: UpdateManifestSchema

  beforeEach(() => {
    context = {
      cwd,
      isVerbose: false,
      nxJsonConfiguration: {},
      projectGraph: {
        dependencies: {},
        nodes: {},
      },
      projectName: 'test',
      projectsConfigurations: {
        projects: { test: { root: projectRoot } },
        version: 2,
      },
      root,
    }

    options = {}

    writeJson(pkgJsonPath, { name: 'test', version: '0.0.0' })
  })

  afterEach(() => {
    rmSync(pkgJsonPath)
  })

  afterAll(async () => {
    const cleanupDirs = [`${cwd}/${root}`]
    await Promise.all(
      cleanupDirs.map(async dir => await rm(dir, { force: true, recursive: true })),
    )
  })

  it('runs successfully', async () => {
    const output = await executor(options, context)
    expect(output.success).toBe(true)
  })
})
