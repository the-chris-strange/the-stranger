import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

type JsonObject = Record<string, unknown>

const packagePathFields = ['exports', 'main', 'module', 'types', 'typings'] as const

export async function finalizeBuildMetadata(outputPath: string) {
  const manifestPath = join(outputPath, 'package.json')
  if (!existsSync(manifestPath)) {
    throw new Error(`Build output is missing '${manifestPath}'`)
  }

  const manifest = await readJson<JsonObject>(manifestPath)
  for (const field of packagePathFields) {
    if (field in manifest) {
      manifest[field] = rewritePathPrefix(manifest[field], './dist/', './')
    }
  }
  delete manifest['files']
  await writeJson(manifestPath, manifest)

  await Promise.all(
    ['executors.json', 'generators.json'].map(async filename => {
      const collectionPath = join(outputPath, filename)
      if (!existsSync(collectionPath)) return

      const collection = await readJson<JsonObject>(collectionPath)
      await writeJson(collectionPath, rewritePathPrefix(collection, './src/', './'))
    }),
  )
}

export function finalizePublishManifest<T extends object>(manifest: T): T {
  const values = manifest as JsonObject
  for (const field of ['executors', 'generators'] as const) {
    const value = values[field]
    if (typeof value === 'string' && !value.startsWith('./dist/')) {
      values[field] = `./dist/${value.replace(/^\.\//, '')}`
    }
  }

  return manifest
}

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T
}

function rewritePathPrefix(
  value: unknown,
  prefix: string,
  replacement: string,
): unknown {
  if (typeof value === 'string') {
    return value.startsWith(prefix) ? replacement + value.slice(prefix.length) : value
  }
  if (Array.isArray(value)) {
    return value.map(item => rewritePathPrefix(item, prefix, replacement))
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        rewritePathPrefix(item, prefix, replacement),
      ]),
    )
  }
  return value
}

async function writeJson(path: string, value: unknown) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`)
}
