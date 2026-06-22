// @ts-check

const { defineConfig } = require('@yarnpkg/types')

const {
  setNodeEngine,
  enforceConsistentProjectDependencies,
  setRepository,
} = require('./dist/packages/yarn-config')

module.exports = defineConfig({
  async constraints({ Yarn }) {
    for (const ws of Yarn.workspaces()) {
      if (ws.cwd === '.') {
        continue
      }
      enforceConsistentProjectDependencies(Yarn, ws)
      setNodeEngine(Yarn, ws)
      setRepository(Yarn, ws)
    }
  },
})
