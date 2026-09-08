// @ts-check

const {
  setNodeEngine,
  enforceConsistentProjectDependencies,
  setRepository,
  setLicense,
} = require('@the-stranger/yarn-config')
const { defineConfig } = require('@yarnpkg/types')

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
