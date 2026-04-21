import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing'

import { addProject, type ProjectConfig } from './add-project'

/**
 * Create a virtual file structure to use in tests.
 * @param projects project names or configurations to add to the workspace
 * @returns the test tree
 */
export function createTestTree(...projects: (string | ProjectConfig)[]) {
  const tree = createTreeWithEmptyWorkspace()
  for (const project of projects) {
    addProject(tree, project)
  }
  return tree
}
