import { execFile } from 'node:child_process'
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { promisify } from 'node:util'

import { afterEach, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '../..')
const temporaryDirectories = []
const execute = promisify(execFile)

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map(path => rm(path, { force: true, recursive: true })),
  )
})

function node(code, cwd = root, mode = 'module') {
  return execute(process.execPath, [`--input-type=${mode}`, '--eval', code], {
    cwd,
    env: { ...process.env, NODE_OPTIONS: '', NODE_PATH: '' },
    timeout: 25_000,
  })
}

it('loads compiled public ESM entry points', async () => {
  await node(`
    for (const name of ${JSON.stringify(['ordered', 'eslint-config', 'eslint-plugin'])}) {
      await import('@the-stranger/' + name)
    }
    await import('@the-stranger/ordered/package-json')
  `)
})

it('loads Ordered and compiled Nx generators from CommonJS', async () => {
  await node(
    `
    require('@the-stranger/ordered')
    require('@the-stranger/ordered/package-json')
    require('@the-stranger/nx-plugin/generators')
    require('./packages/nx-plugin/dist/generators/library/generator.js')
    require('./tools/nx-plugin/dist/executors/workspace-dependencies/executor.js')
  `,
    root,
    'commonjs',
  )
})

it.each([false, true])(
  'loads consumer configurations with Nx installed: %s',
  async installed => {
    const cwd = await consumer(installed)
    await node(
      `
    import assert from 'node:assert/strict'
    import { ESLint } from 'eslint'
    import { configure } from '@the-stranger/eslint-config'
    import { configs } from '@the-stranger/eslint-plugin'
    assert.ok(configure().length > 0)
    assert.ok(configs.standard.length > 0)
    const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: configs['standard/no-type-checked'] })
    const [result] = await eslint.lintText('export const value: number = 1\\n', { filePath: 'standalone.ts' })
    assert.equal(result.fatalErrorCount, 0)
    const hasNx = configs.recommended.some(config => config.plugins?.['@nx'])
    assert.equal(hasNx, ${installed})
    ${
      installed
        ? "assert.ok(configure({ nx: true }).some(config => config.plugins?.['@nx']))"
        : 'assert.throws(() => configure({ nx: true }), /@nx\\/eslint-plugin/)'
    }
  `,
      cwd,
    )
  },
)

it('does not hide failures inside an installed Nx plugin', async () => {
  const cwd = await consumer(false)
  const plugin = join(cwd, 'node_modules/@nx/eslint-plugin')
  await mkdir(plugin, { recursive: true })
  await writeFile(join(plugin, 'package.json'), JSON.stringify({ main: 'index.cjs' }))
  await writeFile(join(plugin, 'index.cjs'), "throw new Error('broken Nx fixture')")
  await expect(
    node(
      `
    import { configure } from '@the-stranger/eslint-config'
    configure({ nx: true })
  `,
      cwd,
    ),
  ).rejects.toThrow('broken Nx fixture')
})

async function consumer(installed) {
  const cwd = await mkdtemp(join(tmpdir(), 'stranger-consumer-'))
  temporaryDirectories.push(cwd)
  await writeFile(
    join(cwd, 'package.json'),
    JSON.stringify({ name: 'consumer-fixture', private: true, type: 'module' }),
  )
  const copied = new Set(['@the-stranger/eslint-config', '@the-stranger/eslint-plugin'])
  const dependencies = new Set(['eslint'])
  for (const name of copied) {
    const source = join(root, 'packages', name.split('/')[1])
    const destination = join(cwd, 'node_modules', name)
    await mkdir(destination, { recursive: true })
    await cp(join(source, 'dist'), join(destination, 'dist'), { recursive: true })
    await cp(join(source, 'package.json'), join(destination, 'package.json'))
    const manifest = JSON.parse(await readFile(join(source, 'package.json'), 'utf8'))
    for (const dependency of Object.keys(manifest.dependencies))
      dependencies.add(dependency)
  }
  if (installed) dependencies.add('@nx/eslint-plugin')
  for (const dependency of dependencies) {
    if (copied.has(dependency)) continue
    const destination = join(cwd, 'node_modules', dependency)
    await mkdir(dirname(destination), { recursive: true })
    await symlink(join(root, 'node_modules', dependency), destination, 'dir')
  }
  return cwd
}
