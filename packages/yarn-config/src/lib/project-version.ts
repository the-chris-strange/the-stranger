import { Yarn as yarn } from '@yarnpkg/types'

/**
 * Synchronize a project's version with the workspace version.
 * @param yarn the yarn context
 * @param ws a project in the workspace
 * @param versions an array of project version constraints to apply to the workspace
 */
export function setProjectVersion(
  yarn: Yarn,
  ws: Workspace,
  ...versions: ProjectVersion[]
) {
  const projectVersion = versions.find(e => ws.ident && e.name.endsWith(ws.ident))
  if (projectVersion?.version) {
    ws.set('version', projectVersion.version)
  } else {
    const rootWs = yarn.workspace({ cwd: '.' }) ?? undefined
    const wsVersion = rootWs?.manifest?.version
    ws.set('version', wsVersion)
  }
}

export interface ProjectVersion {
  /**
   * The name of the project, with or without an npm scope.
   */
  name: string
  /**
   * The required version of the project, or undefined/unset to disable constraints on the project's version.
   */
  version?: string
}

type Workspace = yarn.Constraints.Workspace
type Yarn = yarn.Constraints.Yarn
