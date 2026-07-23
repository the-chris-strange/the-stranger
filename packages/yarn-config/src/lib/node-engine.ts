import type { ConstraintOptions, Workspace, Yarn } from './types'

import { getManifest } from './manifest'

/**
 * Define the engines.node field of a workspace's package.json. If the field is defined in the root manifest, the version specified therein is enforced. If the field isn't defined, no constraint is required.
 * @param ws a project in the workspace
 * @param yarn the yarn context
 * @param options constraint options
 */
export function setNodeEngine(ws: Workspace, yarn: Yarn, options?: ConstraintOptions) {
  const version = getManifest(yarn.workspace({ cwd: '.' })).engines?.node
  const include = getManifest(ws).private !== true || options?.includePrivate

  if (version && include) {
    ws.set('engines.node', version)
  } else {
    ws.unset('engines.node')
  }
}
