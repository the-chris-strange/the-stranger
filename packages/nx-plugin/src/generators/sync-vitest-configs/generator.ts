import { type Tree, formatFiles } from '@nx/devkit'

import type { SyncGeneratorResult } from 'nx/src/utils/sync-generators'

const rootConfigPaths = ['mts', 'ts', 'js', 'mjs', 'cjs', 'cts'].map(
  extension => `vitest.config.${extension}`,
)
const workspaceConfigPaths = ['vitest.workspace.mts', 'vitest.workspace.ts'] as const

/**
 * Migrate deprecated root Vitest workspace files to a Vitest project config.
 * @param tree the Nx virtual file system
 * @returns details when the workspace configuration was out of sync
 */
export async function syncVitestConfigsGenerator(
  tree: Tree,
): Promise<SyncGeneratorResult> {
  const workspacePaths = workspaceConfigPaths.filter(path => tree.exists(path))

  if (workspacePaths.length === 0) {
    return
  }

  const projectConfigPath = rootConfigPaths.find(path => tree.exists(path))
  if (projectConfigPath) {
    throw new Error(
      `Cannot migrate ${workspacePaths.join(', ')} because ${projectConfigPath} already exists. Merge the project selections manually; both files were preserved.`,
    )
  }
  if (workspacePaths.length > 1) {
    throw new Error(
      `Cannot migrate multiple workspace configs: ${workspacePaths.join(', ')}. Merge them manually; both files were preserved.`,
    )
  }

  const workspacePath = workspacePaths[0]
  const configPath = workspacePath.replace('.workspace.', '.config.')

  const workspaceContents = tree.read(workspacePath, 'utf8')
  if (workspaceContents === null) {
    return
  }

  tree.write(configPath, convertWorkspaceConfig(workspaceContents, workspacePath))
  for (const path of workspacePaths) {
    tree.delete(path)
  }
  await formatFiles(tree)

  return syncResult([
    `Converted ${workspacePath} to ${configPath}.`,
    ...workspacePaths
      .slice(1)
      .map(path => `Removed duplicate deprecated workspace config ${path}.`),
  ])
}

function addDefineProjectImport(contents: string) {
  const importPattern = /import\s*\{([\s\S]*?)\}\s*from\s*(['"])vitest\/config\2\s*;?/
  const importMatch = importPattern.exec(contents)

  if (!importMatch) {
    return `import { defineProject } from 'vitest/config'${
      contents ? `\n\n${contents}` : ''
    }`
  }

  const imports = importMatch[1]
    .split(',')
    .map(name => name.trim())
    .filter(name => name && name !== 'defineProject' && name !== 'defineWorkspace')

  return contents.replace(
    importPattern,
    `import { ${['defineProject', ...imports].join(', ')} } from ${importMatch[2]}vitest/config${importMatch[2]}`,
  )
}

function convertWorkspaceConfig(contents: string, path: string) {
  const exportMatch = /export\s+default\s+/.exec(contents)
  if (!exportMatch) {
    throw new Error(`Cannot migrate ${path} because it does not have a default export.`)
  }

  const beforeExport = contents.slice(0, exportMatch.index).trim()
  let projects = contents.slice(exportMatch.index + exportMatch[0].length).trim()
  projects = projects.replace(/;\s*$/, '')

  const defineWorkspaceMatch = /^defineWorkspace\s*\(([\s\S]*)\)$/.exec(projects)
  if (defineWorkspaceMatch) {
    projects = defineWorkspaceMatch[1].trim()
  }

  const importsAndDeclarations = addDefineProjectImport(beforeExport)
  return `${importsAndDeclarations}

export default defineProject({
  test: {
    projects: ${projects},
  },
})
`
}

function syncResult(outOfSyncDetails: string[]): Exclude<SyncGeneratorResult, void> {
  return {
    outOfSyncDetails,
    outOfSyncMessage: 'The workspace Vitest configuration is out of sync.',
  }
}

export default syncVitestConfigsGenerator
