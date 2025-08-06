import { addProjectConfiguration, ProjectConfiguration, Tree } from '@nx/devkit'

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
