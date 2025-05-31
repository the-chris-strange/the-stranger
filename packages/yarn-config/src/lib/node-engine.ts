import { Yarn as yarn } from '@yarnpkg/types'

/**
 * Define the engines.node field of a workspace's package.json. If the field is defined in the root manifest, the version specified therein is enforced. If the field isn't defined, no constraint is required.
 * @param yarn the yarn context
 * @param ws a project in the workspace
 */
export function setNodeEngine(yarn: Yarn, ws: Workspace) {
  const version = yarn.workspace({ cwd: '.' })?.manifest?.['engines']?.['node']
  if (version) {
    ws.set('engines.node', version)
  } else {
    ws.unset('engines.node')
  }
}

type Workspace = yarn.Constraints.Workspace
type Yarn = yarn.Constraints.Yarn
