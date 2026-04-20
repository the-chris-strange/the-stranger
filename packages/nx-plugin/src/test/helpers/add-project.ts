import {
  addProjectConfiguration,
  type ProjectConfiguration,
  type Tree,
} from '@nx/devkit'

/**
 * Add a project to the virtual file system for use in tests.
 * @param tree the virtual test tree
 * @param config the project name or configuration object
 */
export function addProject(tree: Tree, config: string | ProjectConfig) {
  if (typeof config === 'string') {
    config = { name: config }
  }
  config.root ??= `packages/${config.name}`
  addProjectConfiguration(tree, config.name, config as ProjectConfiguration)
}

export type ProjectConfig = Omit<ProjectConfiguration, 'name' | 'root'> &
  Partial<Pick<ProjectConfiguration, 'root'>> &
  Required<Pick<ProjectConfiguration, 'name'>>
