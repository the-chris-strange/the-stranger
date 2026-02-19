import path from 'node:path'

import { PromiseExecutor, workspaceRoot } from '@nx/devkit'
import { PackageJson } from 'nx/src/utils/package-json'
import sortPackageJson from 'sort-package-json'

import { exists } from '../../lib/exists'
import { readJson, writeJson } from '../../lib/json'
import { getLogger } from '../../lib/logging'
import { propertyPath, setPropertyPath } from '../../lib/property-path'
import { SyncManifestSchema } from './schema'

const executor: PromiseExecutor<SyncManifestSchema> = async (options, context) => {
  const logger = getLogger(path.basename(__dirname))
  if (!options.manifest) {
    if (!context.projectName) {
      logger.error('no project specified')
      return { success: false }
    }

    logger.log(`running on project ${context.projectName}`, options)

    const projectConfig = context.projectsConfigurations.projects[context.projectName]
    options.manifest = path.join(projectConfig.root, 'package.json')
  }

  if (exists(options.manifest)) {
    const rootManifest = readJson<PackageJson>(path.join(workspaceRoot, 'package.json'))
    const projectManifest = readJson<PackageJson>(options.manifest)

    for (const field of options.syncFields ?? []) {
      const rootValue = propertyPath(rootManifest, field)
      if (rootValue === undefined) {
        logger.warn(`"${field}" is not set in the root package.json`)
        continue
      }
      setPropertyPath(projectManifest, field, rootValue)
    }

    writeJson<PackageJson>(options.manifest, sortPackageJson(projectManifest))
  } else {
    logger.warn(`no package.json found at ${options.manifest}`)
  }
  return { success: true }
}

export default executor
