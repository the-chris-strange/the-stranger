import { resolve } from 'node:path'

import {
  type PromiseExecutor,
  getOutputsForTargetAndConfiguration,
  logger,
  workspaceRoot,
} from '@nx/devkit'

import type { WorkspaceDependenciesSchema } from './schema'

import { getWorkspaceDependencies } from './get-workspace-dependencies'
import { findPackageJson, readPackageJson, writePackageJson } from './package-json'

const runExecutor: PromiseExecutor<WorkspaceDependenciesSchema> = async (
  options,
  context,
) => {
  if (!context.projectName) {
    logger.error('Unable to determine which project to update')
    return { success: false }
  }

  const projectNode = context.projectGraph.nodes[context.projectName]
  if (!projectNode) {
    logger.error(`Project ${context.projectName} not found in project graph`)
    return { success: false }
  }

  const sourcePath = resolveWorkspacePath(options.source ?? projectNode.data.root)
  const sourceManifest = await readPackageJson(sourcePath)
  if (!options.destination) {
    const outputs = getOutputsForTargetAndConfiguration(
      { project: context.projectName, target: 'build' },
      {},
      projectNode,
    )
    options.destination = findPackageJson(
      outputs.map(resolveWorkspacePath),
    ).next().value
  }

  if (!options.destination) {
    logger.error('Unable to determine manifest file to update')
    return { success: false }
  }

  try {
    const destinationPath = resolveWorkspacePath(options.destination)
    const destManifest = await readPackageJson(destinationPath)

    for await (const dependency of getWorkspaceDependencies(sourceManifest)) {
      destManifest[dependency.dependencySet] ??= {}
      destManifest[dependency.dependencySet]![dependency.name] =
        `${options.resolvedVersionPrefix ?? '^'}${dependency.version}`
    }

    await writePackageJson(destinationPath, destManifest)

    return { success: true }
  } catch (error) {
    logger.error(error)
    return { success: false }
  }
}

export default runExecutor

function resolveWorkspacePath(path: string) {
  return resolve(workspaceRoot, path)
}
