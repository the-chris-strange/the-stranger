import path from 'node:path'

import { logger, PromiseExecutor } from '@nx/devkit'
import { PackageJson } from 'nx/src/utils/package-json'
import sortPackageJson from 'sort-package-json'

import { exists } from '../../lib/exists'
import { maybeReadJson, readJson, writeJson } from '../../lib/json'
import { UpdateManifestSchema } from './schema'

const executor: PromiseExecutor<UpdateManifestSchema> = async (options, context) => {
  console.dir(context)
  if (!context.projectName) {
    logger.error('A target project must be specified for the update-manifest executor')
    return { success: false }
  }

  logger.log(`Updating manifest for ${context.projectName}`, options)

  const projectConfig = context.projectsConfigurations.projects[context.projectName]
  const srcPath = path.join(projectConfig.root, 'package.json')

  if (exists(srcPath)) {
    const srcManifest = readJson<PackageJson>(srcPath)
    const destPath = path.join(options.destination ?? 'dist', srcPath)

    if (options.force || options.unset === true) {
      writeJson(destPath, sortPackageJson(srcManifest))
      return { success: true }
    }

    options.unset = options.unset || []

    const destManifest = maybeReadJson<PackageJson>(destPath)
    if (destManifest) {
      for (const p of options.unset) {
        if ((options.skipSourceCheck || !(p in srcManifest)) && p in destManifest) {
          delete destManifest[p as keyof PackageJson]
        }
      }
      writeJson(destPath, sortPackageJson(destManifest))
    }
  } else {
    logger.warn(`No package.json found in ${projectConfig.root}`)
  }
  return { success: true }
}

export default executor
