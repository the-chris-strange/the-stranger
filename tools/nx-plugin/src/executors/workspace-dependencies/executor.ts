import { existsSync, statSync } from 'node:fs'
import { copyFile, cp, mkdir, rm } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'

import {
  type PromiseExecutor,
  getOutputsForTargetAndConfiguration,
  logger,
  workspaceRoot,
} from '@nx/devkit'

import type { WorkspaceDependenciesSchema } from './schema'

import { finalizePublishManifest } from '../build-package/package-metadata'
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
  if (options.stage) {
    if (!options.destination) {
      logger.error('A destination is required when staging a package')
      return { success: false }
    }

    await stagePackage(sourcePath, resolveWorkspacePath(options.destination))
  }

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
    if (options.stage) finalizePublishManifest(destManifest)
    const destinationManifestPath = findPackageJson([destinationPath]).next().value
    if (!destinationManifestPath) {
      throw new Error(`Unable to find a package manifest in '${destinationPath}'`)
    }

    for await (const dependency of getWorkspaceDependencies(sourceManifest)) {
      destManifest[dependency.dependencySet] ??= {}
      destManifest[dependency.dependencySet]![dependency.name] =
        `${options.resolvedVersionPrefix ?? '^'}${dependency.version}`
    }

    await writePackageJson(destinationManifestPath, destManifest)

    return { success: true }
  } catch (error) {
    logger.error(error)
    return { success: false }
  }
}

export default runExecutor

async function copyIfPresent(source: string, destination: string) {
  if (existsSync(source)) {
    await copyFile(source, destination)
  }
}

async function copyMarkdownDocs(source: string, destination: string) {
  if (!existsSync(source)) return

  await cp(source, destination, {
    filter: path => statSync(path).isDirectory() || path.endsWith('.md'),
    recursive: true,
  })
}

function resolveWorkspacePath(path: string) {
  return resolve(workspaceRoot, path)
}

async function stagePackage(source: string, destination: string) {
  const sourceManifest = findPackageJson([source]).next().value
  if (!sourceManifest) {
    throw new Error(`Unable to find a package manifest in '${source}'`)
  }

  const projectRoot = dirname(sourceManifest)
  await rm(destination, { force: true, recursive: true })
  await mkdir(destination, { recursive: true })

  await copyFile(sourceManifest, join(destination, 'package.json'))
  await copyIfPresent(join(projectRoot, 'README.md'), join(destination, 'README.md'))
  await copyIfPresent(join(workspaceRoot, 'LICENSE'), join(destination, 'LICENSE'))
  await copyMarkdownDocs(join(projectRoot, 'docs'), join(destination, 'docs'))

  const distribution = join(projectRoot, 'dist')
  if (!existsSync(distribution)) {
    throw new Error(`Unable to find build output in '${distribution}'`)
  }
  const buildManifest = join(distribution, 'package.json')
  await cp(distribution, join(destination, 'dist'), {
    filter: source => source !== buildManifest,
    recursive: true,
  })
}
