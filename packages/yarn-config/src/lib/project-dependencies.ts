import chalk from 'chalk'
import { satisfies, validRange } from 'semver'

import type { Yarn as yarn } from '@yarnpkg/types'

/**
 * Require that any dependency of a project is also a dependency of the root workspace. If the dependency is a peer dependency, its range must be satisfied by the workspace version. If the dependency is a regular dependency, its range is updated to match the workspace version.
 * @param yarn the yarn context
 * @param ws a project in the workspace
 */
export function enforceConsistentProjectDependencies(yarn: Yarn, ws: Workspace) {
  const workspace = yarn.workspace({ cwd: '.' }) ?? undefined

  for (const pkg of yarn.dependencies({ workspace: ws })) {
    if (pkg.range.startsWith('workspace')) {
      continue
    }

    const rootPkg = yarn.dependency({ ident: pkg.ident, workspace })

    if (!rootPkg) {
      pkg.error(underlined`${pkg.ident} is not installed in the workspace.`)
    } else if (pkg.type === 'peerDependencies') {
      // TODO: also require that peer dependencies are listed in the project's devDependencies
      const pkgRange = validRange(pkg.range)
      const rootVersion = rootPkg.resolution?.version

      if (!rootVersion) {
        pkg.error(
          underlined`Unable to determine the version of ${pkg.ident} installed in the workspace.`,
        )
      } else if (!pkgRange) {
        pkg.error(
          underlined`Unable to parse peer dependency range ${pkg.range} of ${pkg.ident}.`,
        )
      } else if (!satisfies(rootVersion, pkgRange)) {
        pkg.error(
          underlined`Peer dependency range ${pkg.range} of ${pkg.ident} is not satisfied by version ${rootPkg.range} installed in the workspace.`,
        )
      }
    } else {
      pkg.update(rootPkg.range)
    }
  }
}

function underlined(template: TemplateStringsArray, ...args: any[]) {
  return template.reduce((acc, str, i) => {
    const arg = args[i]
    return acc + str + (arg === undefined ? '' : chalk.bold.underline(arg))
  }, '')
}

type Workspace = yarn.Constraints.Workspace
type Yarn = yarn.Constraints.Yarn
