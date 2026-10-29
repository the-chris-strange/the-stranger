import { describe, expect, it } from 'vitest'

import type { PackageManifest } from './manifest'
import type { ProjectVersion } from './project-version'
import type { Workspace, Yarn } from './types'

import { defineConstraints } from './define-constraints'
import { setLicense } from './license'
import { setNodeEngine } from './node-engine'
import { setProjectVersion } from './project-version'

function workspace(overrides: Partial<PackageManifest> = {}): Workspace {
  const manifest: Record<string, unknown> = {
    name: '@scope/foo',
    version: '0.5.0',
    ...structuredClone(overrides),
  }
  const update = (path: string | string[], value: unknown, remove = false) => {
    const parts = typeof path === 'string' ? path.split('.') : path
    let parent = manifest
    for (const key of parts.slice(0, -1)) {
      parent[key] ??= {}
      parent = parent[key] as Record<string, unknown>
    }
    if (remove) Reflect.deleteProperty(parent, parts.at(-1)!)
    else parent[parts.at(-1)!] = value
  }
  const ws: Workspace = {
    cwd: 'packages/foo',
    error(message) {
      throw new Error(message)
    },
    ident: manifest['name'] as string,
    manifest,
    pkg: {
      dependencies: new Map(),
      ident: manifest['name'] as string,
      optionalPeerDependencies: new Map(),
      peerDependencies: new Map(),
      version: manifest['version'] as string,
      workspace: null,
    },
    set: (path, value) => update(path, value),
    unset: path => update(path, undefined, true),
  }
  ws.pkg.workspace = ws
  return ws
}

function context(overrides: Partial<PackageManifest> = {}): Yarn {
  const root = workspace({
    engines: { node: '^24' },
    license: 'MIT',
    repository: { type: 'git', url: 'https://example.test/root' },
    version: '1.0.0',
    ...overrides,
  })
  root.cwd = '.'
  return { workspace: () => root } as Yarn
}

describe('constraint values', () => {
  it('Uses explicit license, Node range, and repository values', async () => {
    const ws = workspace()
    await defineConstraints({
      license: 'Apache-2.0',
      nodeEngines: '>=22',
      repository: { type: 'git', url: 'https://example.test/custom' },
    })(ws, context())

    expect(ws.manifest).toMatchObject({
      engines: { node: '>=22' },
      license: 'Apache-2.0',
      repository: {
        directory: 'packages/foo',
        type: 'git',
        url: 'https://example.test/custom',
      },
    })
  })

  it('Inherits root values for boolean options and existing helper callers', async () => {
    const ws = workspace()
    const yarn = context()
    await defineConstraints({ license: true, nodeEngines: true, repository: true })(
      ws,
      yarn,
    )
    setLicense(ws, yarn)
    setNodeEngine(ws, yarn)

    expect(ws.manifest).toMatchObject({
      engines: { node: '^24' },
      license: 'MIT',
      repository: { directory: 'packages/foo', url: 'https://example.test/root' },
    })
  })

  it('Accepts explicit strings through the public helpers', () => {
    const ws = workspace()
    setLicense(ws, 'Apache-2.0')
    setNodeEngine(ws, '>=22')

    expect(ws.manifest).toMatchObject({
      engines: { node: '>=22' },
      license: 'Apache-2.0',
    })
  })

  it.each([undefined, { license: false, nodeEngines: false, repository: false }])(
    'Leaves disabled constraints unchanged for %j',
    async options => {
      const ws = workspace({
        engines: { node: '>=20' },
        license: 'Apache-2.0',
        repository: { url: 'https://example.test/keep' },
      })
      const before: unknown = structuredClone(ws.manifest)
      await defineConstraints(options)(ws, context())
      expect(ws.manifest).toStrictEqual(before)
    },
  )

  it.each([false, true])('Honors includePrivate=%s', async includePrivate => {
    const ws = workspace({
      engines: { node: '>=20' },
      license: 'Apache-2.0',
      private: true,
      repository: { url: 'https://example.test/old' },
    })
    await defineConstraints({
      license: true,
      nodeEngines: true,
      options: { includePrivate },
      repository: true,
    })(ws, context())

    expect(ws.manifest.license).toBe(includePrivate ? 'MIT' : undefined)
    expect(ws.manifest.engines?.node).toBe(includePrivate ? '^24' : undefined)
    expect(ws.manifest.repository?.url).toBe(
      includePrivate ? 'https://example.test/root' : undefined,
    )
  })

  it('Unsets repository metadata when the root has none', async () => {
    const ws = workspace({ repository: { url: 'https://example.test/old' } })
    await defineConstraints({ repository: true })(
      ws,
      context({ repository: undefined }),
    )
    expect(ws.manifest.repository).toBeUndefined()
  })
})

describe('project version selection', () => {
  it.each([
    ['@scope/foo', [{ name: 'foo', version: '2.0.0' }], '2.0.0'],
    ['@scope/foo', [{ name: '@scope/foo', version: '2.1.0' }], '2.1.0'],
    ['foo', [{ name: 'myfoo', version: '9.0.0' }], '1.0.0'],
    ['@scope/foo', [{ name: '@other/foo', version: '9.0.0' }], '1.0.0'],
    [
      '@scope/foo',
      [
        { name: 'foo', version: '2.0.0' },
        { name: '@scope/foo', version: '3.0.0' },
      ],
      '3.0.0',
    ],
    [
      '@scope/foo',
      [
        { name: 'foo', version: '2.0.0' },
        { name: 'foo', version: '3.0.0' },
      ],
      '2.0.0',
    ],
    ['@scope/foo', [{ name: '@scope/foo' }], '0.5.0'],
    ['@scope/foo', [{ name: 'foo' }], '0.5.0'],
    ['@scope/foo', [], '1.0.0'],
  ] satisfies [string, ProjectVersion[], string][])(
    'Selects %s from %j as %s',
    (name, versions, expected) => {
      const ws = workspace({ name })
      setProjectVersion(ws, context(), ...versions)
      expect(ws.manifest.version).toBe(expected)
    },
  )
})
