const { defineConfig } = require('@yarnpkg/types')

/**
 * @typedef {import('@yarnpkg/types').Yarn} Yarn
 * @typedef {import('@yarnpkg/types').Context} Config
 * @typedef {import('@yarnpkg/types').Context} Context
 * @typedef {import('@yarnpkg/types').Workspace} Workspace
 * @typedef {import('@yarnpkg/types').Dependency} Dependency
 */

/**
 * Require that any dependency of a project is also a dependency of the root workspace.
 * @param {Yarn} yarn the yarn context
 * @param {Workspace} project a project in the workspace
 */
async function enforceConsistentProjectDependencies(yarn, project) {
  const rootWs = yarn.workspace({ cwd: '.' })

  for (const pkg of yarn.dependencies({ workspace: project })) {
    if (pkg.type === 'peerDependencies') {
      continue
    }

    const rootPkg = yarn.dependency({ workspace: rootWs, ident: pkg.ident })
    if (rootPkg) {
      pkg.update(rootPkg.range)
    } else {
      pkg.delete()
    }
  }
}

/**
 * Define the engines.node field of a workspace's package.json.
 * @param {Workspace} project a project in the workspace
 */
function setNodeEngine(project) {
  project.set('engines.node', '^22')
}

/**
 * Synchronize a project's version with the workspace version.
 * @param {Workspace} project a project in the workspace
 * @param {string} wsVersion the version of the root package.json
 */
function setProjectVersion(project, wsVersion) {
  project.set('version', wsVersion)
}

module.exports = defineConfig({
  async constraints({ Yarn }) {
    for (const ws of Yarn.workspaces()) {
      setNodeEngine(ws)
      setProjectVersion(ws, Yarn.workspace({ cwd: '.' }).pkg.version)
      enforceConsistentProjectDependencies(Yarn, ws)
    }
  },
})
