// @ts-check

const { defineConfig } = require('@yarnpkg/types')

const {
  setNodeEngine,
  enforceConsistentProjectDependencies,
  setRepository,
  setLicense,
} = require('./dist/packages/yarn-config')

module.exports = defineConfig({
  async constraints({ Yarn }) {
    for (const ws of Yarn.workspaces()) {
      if (ws.cwd === '.') {
        continue
      }
      enforceConsistentProjectDependencies(ws, Yarn)
      setNodeEngine(ws, Yarn)
      setRepository(ws, Yarn)
      setLicense(ws, Yarn)
    }
  },
})
