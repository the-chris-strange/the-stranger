import type { RepositoryObject } from './manifest'
import type { ConstraintOptions, Workspace, Yarn } from './types'

import { setLicense } from './license'
import { setNodeEngine } from './node-engine'
import { enforceConsistentProjectDependencies } from './project-dependencies'
import { type ProjectVersion, setProjectVersion } from './project-version'
import { setRepo } from './repository'

export function defineConstraints(config?: ConstraintsOptions) {
  const constraints: ConstraintFunction[] = []
  const { dependencies, license, nodeEngines, projectVersions, repository } =
    config ?? {}

  if (dependencies) {
    constraints.push(enforceConsistentProjectDependencies)
  }

  if (nodeEngines) {
    constraints.push((ws, yarn, options) =>
      setNodeEngine(ws, typeof nodeEngines === 'string' ? nodeEngines : yarn, options),
    )
  }

  if (license) {
    constraints.push((ws, yarn, options) =>
      setLicense(ws, typeof license === 'string' ? license : yarn, options),
    )
  }

  if (repository) {
    constraints.push((ws, yarn, options) =>
      setRepo(ws, typeof repository === 'object' ? repository : yarn, options),
    )
  }

  if (Array.isArray(projectVersions)) {
    constraints.push((ws, yarn) => setProjectVersion(ws, yarn, ...projectVersions))
  }

  return async (ws: Workspace, yarn: Yarn) => {
    for (const constraint of constraints) {
      await constraint(ws, yarn, config?.options)
    }
  }
}

export interface ConstraintsOptions {
  dependencies?: boolean
  license?: boolean | string
  nodeEngines?: boolean | string
  options?: ConstraintOptions
  projectVersions?: ProjectVersion[]
  repository?: boolean | RepositoryObject
}

type ConstraintFunction = (
  ws: Workspace,
  yarn: Yarn,
  options?: ConstraintOptions,
) => Promise<void> | void
