import type { Workspace } from './types'

/**
 * Get an object representing a project's or the workspace package.json.
 * @param ws the workspace
 * @returns the parsed manifest
 */
export function getManifest(ws?: Workspace | null) {
  if (!ws?.manifest) {
    throw new Error(`The ${ws?.ident} workspace doesn't have a manifest`)
  }
  return ws.manifest as PackageManifest
}

export function isPrivate(ws: Workspace) {
  return getManifest(ws).private === true
}

export function isRepository(value: unknown): value is RepositoryObject {
  const allowedKeys = new Set(['directory', 'type'])
  if (
    value &&
    typeof value === 'object' &&
    'url' in value &&
    typeof value.url === 'string'
  ) {
    return Object.keys(value).every(
      key =>
        key === 'url' ||
        (allowedKeys.has(key) && isStringOrUndefined(value[key as keyof typeof value])),
    )
  }
  return false
}

export interface PackageManifest {
  name: string
  version: string
  private?: boolean
  description?: string
  keywords?: string[]
  homepage?: string
  repository?: string | RepositoryObject
  license?: string
  author?: Author
  maintainers?: Author[]
  contributors?: Author[]
  type?: 'commonjs' | 'module'
  imports?: Record<`#${string}`, PackageExport>
  exports?: PackageExport
  main?: string
  module?: string
  types?: string
  directories?: PackageDirectories
  files?: string[]
  workspaces?: string[]
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  peerDependenciesMeta?: Record<string, { optional?: boolean }>
  optionalDependencies?: Record<string, string>
  bundleDependencies?: boolean | string[]
  engines?: NodeEngines
  publishConfig?: PublishConfig
  executors?: string
  generators?: string
}

export interface RepositoryObject {
  url: string
  directory?: string
  type?: string
}

function isStringOrUndefined(value: unknown): value is string | undefined {
  return value === undefined || typeof value === 'string'
}

type Author = string | PersonObject

type JsonValue =
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue }
  | null

interface NodeEngines {
  node?: string
  runtime?: PackageRuntime[]
  vscode?: string
}

interface PackageDirectories {
  bin?: string
  doc?: string
  example?: string
  lib?: string
  man?: string
  test?: string
}

type PackageExport =
  | string
  | PackageExport[]
  | { [conditionOrSubpath: string]: PackageExport }
  | null

interface PackageRuntime {
  name: string
  version?: string
  onFail: 'download' | 'error' | 'ignore' | 'warn'
}

interface PersonObject {
  name: string
  email?: string
  url?: string
}

interface PublishConfig {
  [key: string]: JsonValue | undefined
  access?: 'public' | 'restricted'
  executableFiles?: string[]
  provenance?: boolean
  registry?: string
  tag?: string
}
