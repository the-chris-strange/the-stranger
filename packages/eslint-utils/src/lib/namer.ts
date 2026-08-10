import { readFileSync } from 'node:fs'
import { findPackageJSON } from 'node:module'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const packageJsonPath = findPackageJSON(
  '.',
  pathToFileURL(join(process.cwd(), 'index.js')),
)

if (!packageJsonPath) {
  throw new Error('Unable to find the consuming package.json')
}

const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as PackageJson
const { name } = pkg

if (!name) {
  throw new Error(`Consuming package at ${packageJsonPath} does not have a name`)
}

const packageName: string = name

/**
 * Prepend the consuming package's base name to a string. Useful for naming ESLint configuration objects.
 * @internal
 * @param value the value to add to the name
 * @returns prefixed value
 */
export function namer(value?: string) {
  const ws = /@[a-z-]+\/eslint/i.exec(packageName)?.[0] ?? packageName
  if (value) {
    return value.startsWith(ws) ? value : `${ws}/${value}`
  }
  return ws
}

interface PackageJson {
  name?: string
}
