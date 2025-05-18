// @ts-check

const { defineConfig } = require('@yarnpkg/types')

/**
 * @typedef {import('@yarnpkg/types').Yarn.Constraints.Yarn} Yarn
 * @typedef {import('@yarnpkg/types').Yarn.Constraints.Context} Context
 * @typedef {import('@yarnpkg/types').Yarn.Constraints.Workspace} Workspace
 * @typedef {import('@yarnpkg/types').Yarn.Constraints.Dependency} Dependency
 */

/**
 * @typedef ProjectVersion
 * @property {string} name the name of the project, with or without an npm scope
 * @property {string} [version] the required version of the project, or undefined/unset to disable constraints on the project's version
 */

/**
 * @type {ProjectVersion[]}
 */
const projectVersions = [{ name: '@the-stranger/eslint-plugin' }]

/**
 * Require that any dependency of a project is also a dependency of the root workspace.
 * @param {Yarn} yarn the yarn context
 * @param {Workspace} project a project in the workspace
 */
async function enforceConsistentProjectDependencies(yarn, project) {
  const rootWs = yarn.workspace({ cwd: '.' }) ?? undefined

  for (const pkg of yarn.dependencies({ workspace: project })) {
    if (pkg.type === 'peerDependencies') {
      continue
    }

    const rootPkg = yarn.dependency({ workspace: rootWs, ident: pkg.ident })
    if (rootPkg) {
      pkg.update(rootPkg.range)
    } else {
      pkg.error(`"${pkg.ident}" is not installed in the workspace.`)
    }
  }
}

/**
 * Define the engines.node field of a workspace's package.json. If the field is defined in the root manifest, the version specified therein is enforced. If the field isn't defined, no constraint is required.
 * @param {Workspace} project a project in the workspace
 * @param {string|null} [version] the value specified in the workspace-level package.json
 */
function setNodeEngine(project, version) {
  if (version) {
    project.set('engines.node', version)
  }
}

/**
 * Synchronize a project's version with the workspace version.
 * @param {Workspace} project a project in the workspace
 * @param {string|null} [wsVersion] the version of the root package.json
 */
function setProjectVersion(project, wsVersion) {
  const projectVersion = projectVersions.find(
    e => project.ident && e.name.endsWith(project.ident),
  )
  if (projectVersion) {
    if (projectVersion.version) {
      project.set('version', projectVersion.version)
    }
  } else {
    project.set('version', wsVersion)
  }
}

module.exports = defineConfig({
  async constraints({ Yarn }) {
    const root = Yarn.workspace({ cwd: '.' })
    for (const ws of Yarn.workspaces()) {
      enforceConsistentProjectDependencies(Yarn, ws)
      setNodeEngine(ws, root?.manifest?.['engines']?.['node'])
      setProjectVersion(ws, root?.pkg.version)
    }
  },
})
