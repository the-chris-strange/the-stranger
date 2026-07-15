import { defineConfig } from '@yarnpkg/types'

import { defineConstraints } from './lib/define-constraints'

export { defineConstraints } from './lib/define-constraints.js'
export { setLicense } from './lib/license.js'
export { setNodeEngine } from './lib/node-engine.js'
export { enforceConsistentProjectDependencies } from './lib/project-dependencies.js'
export { setProjectVersion } from './lib/project-version.js'
export { setRepositoryFromRoot as setRepository } from './lib/repository.js'

export default defineConfig({
  async constraints({ Yarn }) {
    for (const ws of Yarn.workspaces()) {
      if (ws.cwd === '.') {
        continue
      }

      const constrain = defineConstraints({
        dependencies: true,
        license: true,
        nodeEngines: true,
        repository: true,
      })

      await constrain(ws, Yarn)
    }
  },
})
