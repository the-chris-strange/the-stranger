import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'

import { logger, parseJson, serializeJson } from '@nx/devkit'
import { FileNotFoundError } from '@the-stranger/nx-plugin'
import sortPackageJson from 'sort-package-json'

import type { PackageJson } from 'nx/src/utils/package-json'

export function* findPackageJson(
  paths: string[],
): Generator<string, undefined, string> {
  for (const path of paths) {
    const pkg = packageJsonOrChild(path)
    if (pkg) {
      yield pkg
    }
  }
}

export async function readPackageJson(path: string): Promise<PackageJson> {
  const pkgJsonPath = findPackageJson([path]).next().value

  if (!pkgJsonPath) {
    throw new PackageJsonNotFoundError(path)
  }

  try {
    const content = await readFile(pkgJsonPath, 'utf8')
    return parseJson<PackageJson>(content, { expectComments: false })
  } catch (error) {
    logger.error(error)
    throw error
  }
}

export async function writePackageJson(filepath: string, content: PackageJson) {
  const dir = dirname(filepath)
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true })
  }

  try {
    await writeFile(filepath, sortPackageJson(serializeJson(content)))
  } catch (error) {
    logger.error(error)
    throw error
  }
}

class PackageJsonNotFoundError extends FileNotFoundError {
  constructor(filepath: string) {
    super(filepath, `No package.json found at '${filepath}'`)
    this.name = 'PackageJsonNotFoundError'
  }
}

function packageJsonOrChild(path: string) {
  if (existsSync(path) && basename(path) === 'package.json') {
    return path
  }

  const child = join(path, 'package.json')
  if (existsSync(child)) {
    return child
  }

  return
}
