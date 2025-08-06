import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing'

import { addProject, ProjectConfig } from './add-project'

export function createTestTree(...packages: (string | ProjectConfig)[]) {
  const tree = createTreeWithEmptyWorkspace()
  for (const pkg of packages) {
    addProject(tree, pkg)
  }
  return tree
}
