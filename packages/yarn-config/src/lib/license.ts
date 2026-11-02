import type { ConstraintOptions, Workspace, Yarn } from './types'

import { getManifest } from './manifest'

/**
 * Require that the `license` field of a workspace's package.json match the root package.json.
 * @param ws a project in the workspace
 * @param yarn the Yarn context to inherit from, or an explicit license
 * @param options constraints options
 */
export function setLicense(
  ws: Workspace,
  yarn: string | Yarn,
  options?: ConstraintOptions,
) {
  const license =
    typeof yarn === 'string' ? yarn : getManifest(yarn.workspace({ cwd: '.' })).license
  const include = getManifest(ws).private !== true || options?.includePrivate

  if (license && include) {
    ws.set('license', license)
  } else {
    ws.unset('license')
  }
}
