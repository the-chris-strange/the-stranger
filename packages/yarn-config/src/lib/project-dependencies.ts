import { Yarn as yarn } from '@yarnpkg/types'

/**
 * Require that any dependency of a project is also a dependency of the root workspace.
 * @param yarn the yarn context
 * @param ws a project in the workspace
 */
export function enforceConsistentProjectDependencies(yarn: Yarn, ws: Workspace) {
  const rootWs = yarn.workspace({ cwd: '.' }) ?? undefined

  for (const pkg of yarn.dependencies({ workspace: ws })) {
    if (pkg.type === 'peerDependencies') {
      continue
    }

    const rootPkg = yarn.dependency({ ident: pkg.ident, workspace: rootWs })
    if (rootPkg) {
      pkg.update(rootPkg.range)
    } else {
      pkg.error(`"${pkg.ident}" is not installed in the workspace.`)
    }
  }
}

type Workspace = yarn.Constraints.Workspace
type Yarn = yarn.Constraints.Yarn
