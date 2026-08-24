import { isAbsolute, relative } from 'node:path'

import {
  type JsonParseOptions,
  type JsonSerializeOptions,
  type Tree,
  readJsonFile,
  readJson as readJsonFromTree,
  writeJsonFile,
  writeJson as writeJsonToTree,
} from '@nx/devkit'

import { FileNotFoundError } from './errors/file-not-found'
import { exists } from './exists'

/**
 * Try to parse a JSON file into a JavaScript object.
 * @param path the path to the file
 * @param tree the NX virtual file system
 * @param options options for parsing the JSON object
 * @returns the parsed content of the file, maybe
 */
export function maybeReadJson<T extends object>(
  path: string,
  tree?: Tree,
  options?: JsonParseOptions,
) {
  try {
    return readJson<T>(path, tree, options)
  } catch (error) {
    if (!(error instanceof FileNotFoundError)) {
      throw error
    }

    return
  }
}

/**
 * Parse a JSON file into a JavaScript object.
 * @param path the path to the file
 * @param tree the NX virtual file system
 * @param options options for parsing the JSON object
 * @template T the expected type of the JSON object
 * @returns the parsed content of the file
 * @throws {FileNotFoundError} if the file doesn't exist
 */
export function readJson<T extends object = any>(
  path: string,
  tree?: Tree,
  options?: JsonParseOptions,
) {
  const treePath = tree && isAbsolute(path) ? relative(tree.root, path) : path

  if (!exists(treePath, tree)) {
    throw new FileNotFoundError(path)
  }

  return tree
    ? readJsonFromTree<T>(tree, treePath, options)
    : readJsonFile<T>(path, options)
}

export function writeJson<T extends object>(
  path: string,
  value: T,
  options?: Tree | WriteJsonOptions,
) {
  const { tree, ...opts } = isWriteJsonOptions(options) ? options : { tree: options }
  if (tree) {
    writeJsonToTree<T>(tree, path, value, opts)
  } else {
    writeJsonFile<T>(path, value, opts)
  }
}

export interface WriteJsonOptions extends JsonSerializeOptions {
  tree?: Tree
}

function isWriteJsonOptions(value: unknown): value is WriteJsonOptions {
  if (value && typeof value === 'object') {
    const expectedKeys = new Set(['spaces', 'tree'])
    return Object.keys(value).every(e => expectedKeys.has(e))
  }
  return false
}
