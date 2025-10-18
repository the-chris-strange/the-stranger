import { Yarn as yarn } from '@yarnpkg/types'

export function getRepository(yarn: Yarn): Repository | undefined {
  const repo = yarn.workspace({ cwd: '.' })?.manifest?.['repository']
  return typeof repo === 'string' ? { url: repo } : repo
}

/**
 * Set the repository field of a project's package.json.
 * @param yarn the yarn context
 * @param ws a project in the workspace
 */
export function setRepository(yarn: Yarn, ws: Workspace) {
  const directory = ws.cwd.replace(/^\.\//, '')
  const repo = getRepository(yarn)
  if (repo) {
    ws.set('repository.url', repo.url)
    ws.set('repository.directory', directory)
  } else {
    ws.unset('repository')
  }
}

export interface Repository {
  url: string
  directory?: string
}

type Workspace = yarn.Constraints.Workspace
type Yarn = yarn.Constraints.Yarn
