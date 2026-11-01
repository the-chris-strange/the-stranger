import { spawnSync } from 'node:child_process'
import { cp, mkdir, readdir } from 'node:fs/promises'
import { join } from 'node:path'

const project = process.argv[2]
if (!project || !/^(?:packages|tools)\/[\w-]+$/.test(project))
  throw new Error('Expected a workspace package path')
const result = spawnSync(
  process.execPath,
  [
    'node_modules/@typescript/native/bin/tsc',
    '--build',
    `${project}/tsconfig.lib.json`,
  ],
  { stdio: 'inherit' },
)
if (result.error) throw result.error
if (result.status !== 0)
  throw new Error(`TypeScript 7 build failed with status ${result.status}`)
const output = join(project.startsWith('tools/') ? 'out-tsc' : 'dist', project)
await mkdir(output, { recursive: true })
for (const entry of await readdir(project, { withFileTypes: true })) {
  if (
    entry.name.endsWith('.md') ||
    ['docs', 'executors.json', 'generators.json', 'package.json'].includes(entry.name)
  ) {
    await cp(join(project, entry.name), join(output, entry.name), { recursive: true })
  }
}
await cp('LICENSE', join(output, 'LICENSE'))
async function copyAssets(directory) {
  for (const entry of await readdir(join(project, directory), {
    withFileTypes: true,
  })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) await copyAssets(path)
    else if (!/\.[cm]?tsx?$/.test(entry.name) || entry.name.endsWith('.d.ts')) {
      await mkdir(join(output, directory), { recursive: true })
      await cp(join(project, path), join(output, path))
    }
  }
}
await copyAssets('src')
