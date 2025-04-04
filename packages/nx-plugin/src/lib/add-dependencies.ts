import { addDependenciesToPackageJson, readJson, Tree } from '@nx/devkit'
import { PackageJson } from 'nx/src/utils/package-json'

/**
 * Add dependencies to a project, using the versions specified in the workspace's root package.json.
 * @param tree the NX virtual file system
 * @param dependencies an array of package names to add to the project's dependencies
 * @param devDependencies an array of package names to add to the project's devDependencies
 * @param packageJsonPath the path to the project's package.json
 */
export function addDependenciesToProject(
  tree: Tree,
  dependencies: string[] = [],
  devDependencies: string[] = [],
  packageJsonPath?: string,
) {
  const rootPkgJson = readJson<PackageJson>(tree, 'package.json')
  const deps: Record<string, string> = {}
  const devDeps: Record<string, string> = {}

  for (const dependency of dependencies) {
    deps[dependency] = getWorkspaceVersion(tree, dependency, rootPkgJson)
  }

  for (const dependency of devDependencies) {
    devDeps[dependency] = getWorkspaceVersion(tree, dependency, rootPkgJson)
  }

  addDependenciesToPackageJson(tree, deps, devDeps, packageJsonPath, true)
}

/**
 * Get the version of a dependency from the workspace's root package.json.
 * @param tree the NX virtual file system
 * @param dependency the name of the dependency
 * @param packageJson a JSON object representing the root package.json file
 * @returns the version of the dependency
 * @throws if the dependency is not listed in the root package.json
 */
export function getWorkspaceVersion(
  tree: Tree,
  dependency: string,
  packageJson?: PackageJson,
) {
  packageJson ??= readJson<PackageJson>(tree, 'package.json')
  const version =
    packageJson.dependencies?.[dependency] ?? packageJson.devDependencies?.[dependency]

  if (version === undefined) {
    throw new Error(`The workspace does not depend on ${dependency}`)
  }

  return version
}
