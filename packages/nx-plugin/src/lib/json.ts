import {
  JsonParseOptions,
  JsonSerializeOptions,
  readJsonFile,
  readJson as readJsonFromTree,
  Tree,
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
    if (error instanceof FileNotFoundError) {
      return
    }
    throw error
  }
}

/**
 * Parse a JSON file into a JavaScript object.
 * @param path the path to the file
 * @param tree the NX virtual file system
 * @param options options for parsing the JSON object
 * @template T the expected type of the JSON object
 * @returns the parsed content of the file
 */
export function readJson<T extends object = any>(
  path: string,
  tree?: Tree,
  options?: JsonParseOptions,
) {
  if (!exists(path, tree)) {
    throw new FileNotFoundError(path)
  }
  return tree
    ? readJsonFromTree<T>(tree, path, options)
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
