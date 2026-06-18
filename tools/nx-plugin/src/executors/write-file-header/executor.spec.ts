import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { type ExecutorContext, workspaceRoot } from '@nx/devkit'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { WriteFileHeaderExecutorSchema } from './schema'

import executor from './executor'

const testDir = path.join(workspaceRoot, 'tmp/tests')
const filenames = ['file1.ts', 'file2.ts', 'file3.ts']

const options: WriteFileHeaderExecutorSchema = {
  files: filenames.map(e => path.join(testDir, e)),
  header: '// the header text',
}
const context: ExecutorContext = {
  cwd: process.cwd(),
  isVerbose: false,
  nxJsonConfiguration: {},
  projectGraph: {
    dependencies: {},
    nodes: {},
  },
  projectsConfigurations: {
    projects: {},
    version: 2,
  },
  root: '',
}

beforeAll(async () => {
  await mkdir(testDir, { recursive: true })
})

beforeEach(async () => {
  await Promise.all(
    options.files.map(async e =>
      writeFile(e, `export const content = "the contents of '${e}'"`),
    ),
  )
})

afterAll(async () => {
  await rm(testDir, { force: true, recursive: true })
})

describe('WriteFileHeader Executor', () => {
  it('runs successfully', async () => {
    const output = await executor(options, context)

    expect(output.success).toBe(true)
  })

  it('writes the file headers', async () => {
    await executor(options, context)

    for (const f of options.files) {
      await expect(readFile(f, 'utf8')).resolves.toMatch(/\/\/ the header text\n\n/)
    }
  })

  it('returns false if any operations fail', async () => {
    const spy = vi.spyOn(await import('./write-header.js'), 'writeHeader')
    spy.mockRejectedValueOnce(new Error('Expected failure'))

    const output = await executor(options, context)

    expect(output.success).toBe(false)
  })
})
