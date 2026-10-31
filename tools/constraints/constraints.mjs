import { createRequire } from 'node:module'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { satisfies } from 'semver'

export function constrainManifest(root, input, directory, installed = {}) {
  const manifest = structuredClone(input)
  const errors = []
  if (manifest.private) {
    delete manifest.license
    delete manifest.repository
    if (manifest.engines) delete manifest.engines.node
  } else {
    manifest.engines = { ...manifest.engines, node: root.engines.node }
    manifest.license = root.license
    manifest.repository = { ...root.repository, directory }
  }
  const rootDependencies = { ...root.dependencies, ...root.devDependencies }
  for (const field of [
    'dependencies',
    'devDependencies',
    'optionalDependencies',
    'peerDependencies',
  ]) {
    for (const [name, range] of Object.entries(manifest[field] ?? {})) {
      if (range.startsWith('workspace:')) continue
      if (!rootDependencies[name]) {
        errors.push(`${name} is not declared in the root manifest`)
      } else if (field === 'peerDependencies') {
        if (!installed[name] || !satisfies(installed[name], range)) {
          errors.push(
            `${name}@${installed[name] ?? 'missing'} does not satisfy peer range ${range}`,
          )
        }
      } else {
        manifest[field][name] = rootDependencies[name]
      }
    }
  }
  return { manifest, errors }
}

async function main() {
  const rootPath = resolve(fileURLToPath(new URL('../..', import.meta.url)))
  const readJson = async path => JSON.parse(await readFile(path, 'utf8'))
  const root = await readJson(resolve(rootPath, 'package.json'))
  const require = createRequire(resolve(rootPath, 'package.json'))
  const installed = {}
  for (const name of Object.keys({ ...root.dependencies, ...root.devDependencies })) {
    try {
      installed[name] = require(`${name}/package.json`).version
    } catch {
      /* Only peers require installed versions. */
    }
  }
  let failed = false
  for (const parent of ['packages', 'tools']) {
    for (const entry of await readdir(resolve(rootPath, parent), {
      withFileTypes: true,
    })) {
      if (!entry.isDirectory()) continue
      const directory = `${parent}/${entry.name}`
      const path = resolve(rootPath, directory, 'package.json')
      let input
      try {
        input = await readJson(path)
      } catch (error) {
        if (error.code === 'ENOENT') continue
        throw error
      }
      const { manifest, errors } = constrainManifest(root, input, directory, installed)
      for (const error of errors) console.error(`${directory}: ${error}`)
      failed ||= errors.length > 0
      if (JSON.stringify(input) !== JSON.stringify(manifest)) {
        if (process.argv.includes('--fix'))
          await writeFile(path, `${JSON.stringify(manifest, null, 2)}\n`)
        else {
          console.error(
            `${directory}: manifest constraints differ (run pnpm constraints --fix)`,
          )
          failed = true
        }
      }
    }
  }
  if (failed) process.exitCode = 1
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  await main()
