import path from 'node:path'

import {
  type NxJsonConfiguration,
  type ProjectConfiguration,
  type Tree,
  generateFiles,
  joinPathFragments,
  offsetFromRoot,
  readJson,
  readNxJson,
  readProjectConfiguration,
  updateJson,
  updateNxJson,
} from '@nx/devkit'

import type { VitestConfigSchema } from './schema'

import { formatFiles } from '../../lib/format-files'
import { owStrategy } from '../../lib/overwrite-strategy'
import { addDependencies } from './dependencies'
import { generateTsc } from './tsconfig'

/**
 * Generate Vitest configuration file for a project.
 * @param tree the NX virtual file system
 * @param options generator options
 */
export async function vitestConfigGenerator(tree: Tree, options: VitestConfigSchema) {
  const project = readProjectConfiguration(tree, options.project)
  const {
    coverageProvider = 'v8',
    globals = false,
    skipDependencies,
    skipTsconfigs,
    testEnvironment = 'node',
  } = options
  const offset = offsetFromRoot(project.root)
  const coveragePath = joinPathFragments(
    offset,
    options.coveragePath ?? '.test-output/coverage',
  )
  const cachePath = joinPathFragments(
    offset,
    options.cachePath ?? 'node_modules/.vitest',
  )

  generateFiles(
    tree,
    path.join(__dirname, 'files'),
    project.root,
    {
      cachePath,
      coveragePath,
      coverageProvider,
      globals,
      project: options.project,
      projectPath: path.dirname(project.root),
      testEnvironment,
      vitestDefaults: {
        coverageProvider: 'v8',
        environment: 'node',
      },
    },
    { overwriteStrategy: owStrategy(options.force) },
  )
  registerSyncGenerator(tree, project.root)

  if (!skipTsconfigs) {
    generateTsc(tree, options)
  }

  if (!skipDependencies) {
    addDependencies(tree, options, joinPathFragments(project.root, 'package.json'))
  }

  await formatFiles(tree, options)
}

function getVitestTargetName(plugins: NxJsonConfiguration['plugins']) {
  const plugin = plugins?.find(
    entry => typeof entry !== 'string' && entry.plugin === '@nx/vitest',
  )
  const options =
    typeof plugin === 'string'
      ? undefined
      : (plugin?.options as { testTargetName?: string } | undefined)
  return options?.testTargetName || 'test'
}

function registerSyncGenerator(tree: Tree, projectRoot: string) {
  const nxJson = readNxJson(tree)
  const globalGenerators = nxJson?.sync?.globalGenerators ?? []
  const projectJsonPath = joinPathFragments(projectRoot, 'project.json')
  const syncGenerator = '@the-stranger/nx-plugin:sync-vitest-configs'

  if (
    globalGenerators.includes(syncGenerator) ||
    (tree.exists(projectJsonPath) &&
      Object.values(
        readJson<ProjectConfiguration>(tree, projectJsonPath).targets ?? {},
      ).some(target => target.syncGenerators?.includes(syncGenerator)))
  ) {
    return
  }

  if (tree.exists(projectJsonPath)) {
    const targetName = getVitestTargetName(nxJson?.plugins)
    updateJson<ProjectConfiguration>(tree, projectJsonPath, json => {
      json.targets ??= {}
      json.targets[targetName] ??= {}
      json.targets[targetName].syncGenerators = [
        ...(json.targets[targetName].syncGenerators ?? []),
        syncGenerator,
      ]
      return json
    })
    return
  }

  if (nxJson) {
    nxJson.sync ??= {}
    nxJson.sync.globalGenerators = [...globalGenerators, syncGenerator]
    updateNxJson(tree, nxJson)
  }
}

export default vitestConfigGenerator
