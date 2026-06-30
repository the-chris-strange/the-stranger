import type { Yarn as yarn } from '@yarnpkg/types'

/**
 * Require that the `license` field of a workspace's package.json match the root package.json.
 * @param yarn the yarn context
 * @param ws a project in the workspace
 */
export function setLicense(yarn: Yarn, ws: Workspace) {
  const license = yarn.workspace({ cwd: '.' })?.manifest?.['license']
  if (license && ws.manifest.private !== true) {
    ws.set('license', license)
  } else {
    ws.unset('license')
  }
}

type Workspace = yarn.Constraints.Workspace
type Yarn = yarn.Constraints.Yarn
