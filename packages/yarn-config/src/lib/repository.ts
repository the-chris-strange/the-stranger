import type { ConstraintOptions, Workspace, Yarn } from './types'

import { type RepositoryObject, getManifest, isPrivate, isRepository } from './manifest'

export function getRootRepository(yarn?: Yarn): RepositoryObject | undefined {
  const repo = getManifest(yarn?.workspace({ cwd: '.' })).repository
  return typeof repo === 'string' ? { url: repo } : repo
}

/**
 * Set the repository field of a project's package.json.
 * @param ws a project in the workspace
 * @param repo the repository information to set or the yarn context
 * @param options options for setting the repository
 */
export function setRepo(
  ws: Workspace,
  repo?: RepositoryObject | Yarn,
  options?: SetRepoOptions,
) {
  const { fromRoot = true, includePrivate = false } = options ?? {}

  if ((isPrivate(ws) && !includePrivate) || (!repo && !fromRoot)) {
    ws.unset('repository')
  } else if (isRepository(repo)) {
    const directory =
      repo.directory === '.' || !repo.directory
        ? ws.cwd.replace(/^\.\//, '')
        : repo.directory

    ws.set('repository.type', repo.type)
    ws.set('repository.url', repo.url)
    ws.set('repository.directory', directory)
  } else if (fromRoot) {
    setRepo(ws, getRootRepository(repo), options)
  }
}

/**
 * Set the repository field of a project's package.json.
 * @param ws a project in the workspace
 * @param repo the repository information to set
 * @param includePrivate update private projects as well as public ones
 */
export function setRepository(
  ws: Workspace,
  repo?: RepositoryObject,
  includePrivate?: boolean,
) {
  if (repo && (ws.manifest.private !== true || includePrivate)) {
    ws.set('repository.type', repo.type)
    ws.set('repository.url', repo.url)
    ws.set('repository.directory', repo.directory ?? ws.cwd.replace(/^\.\//, ''))
  } else if (!repo || (ws.manifest.private && !includePrivate)) {
    ws.unset('repository')
  }
}

/**
 * Set the repository field of a project's package.json using values from the root manifest.
 * @param ws a project in the workspace
 * @param yarn the yarn context
 * @param includePrivate update private projects as well as public ones
 */
export function setRepositoryFromRoot(
  ws: Workspace,
  yarn: Yarn,
  includePrivate?: boolean,
) {
  const repo = getRootRepository(yarn)
  setRepository(ws, repo ? { ...repo, directory: undefined } : repo, includePrivate)
}

export interface SetRepoOptions extends ConstraintOptions {
  /**
   * Use the value from the workspace root's project.json.
   * @default true
   */
  fromRoot?: boolean
}
