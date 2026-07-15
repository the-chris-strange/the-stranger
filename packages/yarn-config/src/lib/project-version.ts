import type { Workspace, Yarn } from './types'

/**
 * Synchronize a project's version with the workspace version.
 * @param ws a project in the workspace
 * @param yarn the yarn context
 * @param versions an array of project version constraints to apply to the workspace
 */
export function setProjectVersion(
  ws: Workspace,
  yarn: Yarn,
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
