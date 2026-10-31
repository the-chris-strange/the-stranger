import assert from 'node:assert/strict'
import { test } from 'node:test'

import { constrainManifest } from './constraints.mjs'

const root = {
  devDependencies: { semver: '^7' },
  engines: { node: '^24 || ^26' },
  license: 'MIT',
  repository: { type: 'git', url: 'https://example.com/repo' },
}
test('normalizes metadata and dependency versions without changing the input', () => {
  const pkg = { dependencies: { local: 'workspace:*', semver: '^6' }, name: 'example' }
  const result = constrainManifest(root, pkg, 'packages/example')
  assert.equal(result.manifest.engines.node, '^24 || ^26')
  assert.equal(result.manifest.repository.directory, 'packages/example')
  assert.equal(result.manifest.license, 'MIT')
  assert.equal(result.manifest.dependencies.semver, '^7')
  assert.equal(result.manifest.dependencies.local, 'workspace:*')
  assert.equal(pkg.dependencies.semver, '^6')
})
test('reports undeclared external dependencies and incompatible peers', () => {
  const pkg = { dependencies: { missing: '^1' }, peerDependencies: { semver: '^6' } }
  assert.equal(
    constrainManifest(root, pkg, 'packages/example', { semver: '7.8.1' }).errors.length,
    2,
  )
})
test('private tools do not inherit published metadata', () => {
  const pkg = {
    engines: { node: '^24' },
    license: 'MIT',
    private: true,
    repository: root.repository,
  }
  const result = constrainManifest(root, pkg, 'tools/example').manifest
  assert.equal(result.license, undefined)
  assert.equal(result.repository, undefined)
  assert.deepEqual(result.engines, {})
})
