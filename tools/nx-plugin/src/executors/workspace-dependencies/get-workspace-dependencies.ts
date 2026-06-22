import { resolve } from 'node:path'

import { createProjectGraphAsync, logger, workspaceRoot } from '@nx/devkit'

import type { PackageJson } from 'nx/src/utils/package-json'

import { readPackageJson } from './package-json'

export async function* getWorkspaceDependencies(
  sourceManifest: PackageJson,
): AsyncGenerator<Dependency> {
  const projectGraph = await createProjectGraphAsync()

  const sourceVersions: Record<string, string> = {}
  for (const project of Object.values(projectGraph.nodes)) {
    const projectManifest = await readPackageJson(
      resolve(workspaceRoot, project.data.root),
    )
    sourceVersions[projectManifest.name] = projectManifest.version
  }

  const depSets = ['dependencies', 'devDependencies'] as const

  for (const dependencySet of depSets) {
    for (const [name, v] of Object.entries(sourceManifest[dependencySet] ?? {})) {
      logger.debug(`Processing ${name}@${v} in ${dependencySet}`)
      if (v.includes('workspace')) {
        logger.debug(`Found workspace dependency ${name}@${v}`)
        yield { dependencySet, name, version: sourceVersions[name] }
      }
    }
  }
}

interface Dependency {
  /**
   * The property in which the source manifest declares the dependency.
   */
  dependencySet: 'dependencies' | 'devDependencies'
  /**
   * The name of the dependency.
   */
  name: string
  /**
   * The current version of the dependency in its *source* package.json.
   */
  version: string
}
