import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { packageJsonSortOrder, sortPackageJson } from './package-json.js'

const directories: string[] = []

async function createMarker(cwd: string, marker: string): Promise<void> {
  if (marker === '.yarn') await mkdir(join(cwd, marker))
  else await writeFile(join(cwd, marker), '')
}

async function directory(): Promise<string> {
  const path = await mkdtemp(join(tmpdir(), 'ordered-package-'))
  directories.push(path)
  return path
}

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map(async path => rm(path, { force: true, recursive: true })),
  )
})

describe('package.json sorting', () => {
  it('places known fields first, unknown public fields next, and private fields last', () => {
    const input = {
      _z: 1,
      z: 2,
      dependencies: {},
      _a: 3,
      name: 'example',
      version: '1',
      scripts: {},
      A: 4,
      a: 5,
      $schema: 'schema',
      exports: '.',
      private: true,
    }
    expect(Object.keys(sortPackageJson(input))).toStrictEqual([
      '$schema',
      'name',
      'version',
      'private',
      'exports',
      'scripts',
      'dependencies',
      'A',
      'a',
      'z',
      '_a',
      '_z',
    ])
    expect(Object.keys(input)).toStrictEqual([
      '_z',
      'z',
      'dependencies',
      '_a',
      'name',
      'version',
      'scripts',
      'A',
      'a',
      '$schema',
      'exports',
      'private',
    ])
  })

  it('lets custom ranks precede the remaining defaults without dropping fields', () => {
    const output = sortPackageJson(
      { _custom: 1, scripts: {}, version: '1', name: 'example', custom: 2 },
      { sortOrder: ['custom', '_custom', 'scripts', 'custom'] },
    )
    expect(Object.keys(output)).toStrictEqual([
      'custom',
      '_custom',
      'scripts',
      'name',
      'version',
    ])
    expect(
      Object.keys(
        sortPackageJson(
          { pnpm: {}, icon: '', name: '' },
          { sortOrder: packageJsonSortOrder },
        ),
      ),
    ).toStrictEqual(['name', 'icon', 'pnpm'])
  })

  it.each([null, undefined, false, 42, 'parsed data only', ['z', 'a'], new Date(0)])(
    'leaves non-object data unchanged: %s',
    input => {
      expect(sortPackageJson(input)).toBe(input)
    },
  )

  it('preserves own prototype-sensitive keys and does not mutate frozen input', () => {
    const input = JSON.parse(
      '{"__proto__":{"polluted":true},"constructor":{"z":1,"a":2},"name":"example","dependencies":{"__proto__":"1","constructor":"2","a":"3"}}',
    ) as Record<string, unknown>
    Object.freeze(input)
    Object.freeze(input['dependencies'])
    const output = sortPackageJson(input)
    expect(Object.hasOwn(output, '__proto__')).toBe(true)
    expect(output['__proto__']).toStrictEqual({ polluted: true })
    expect(Object.getPrototypeOf(output)).toBe(Object.prototype)
    expect(Object.hasOwn(Object.prototype, 'polluted')).toBe(false)
    expect(Object.keys(output['dependencies'] as object)).toStrictEqual([
      '__proto__',
      'a',
      'constructor',
    ])
    expect(Object.keys(input['dependencies'] as object)).toStrictEqual([
      '__proto__',
      'constructor',
      'a',
    ])
    expect(JSON.stringify(output['constructor'])).toBe('{"z":1,"a":2}')
  })

  it('uses canonical ordering for URL, person, directory, binary, badge, and tool records', () => {
    const output = sortPackageJson({
      bugs: { extra: 1, email: 'mail', url: 'url' },
      repository: { z: 1, url: 'url', type: 'git' },
      funding: { z: 1, url: 'url', type: 'donate' },
      license: { z: 1, url: 'url', type: 'MIT' },
      author: { z: 1, url: 'url', email: 'mail', name: 'name' },
      maintainers: [{ url: 'url', name: 'name', email: 'mail' }, 'string person'],
      contributors: [{ email: 'mail', name: 'name' }],
      directories: {
        extra: '',
        test: '',
        example: '',
        doc: '',
        man: '',
        bin: '',
        lib: '',
      },
      binary: {
        z: '',
        host: '',
        package_name: '',
        remote_path: '',
        module_path: '',
        module_name: '',
      },
      badges: [{ extra: '', href: '', url: '', description: '' }],
      volta: { z: '', yarn: '', npm: '', node: '' },
      devEngines: {
        runtime: { z: 1, a: 2 },
        packageManager: { extra: '', onFail: '', version: '', name: '' },
      },
    })
    expect(Object.keys(output.bugs)).toStrictEqual(['url', 'email', 'extra'])
    for (const value of [output.repository, output.funding, output.license])
      expect(Object.keys(value)).toStrictEqual(['type', 'url', 'z'])
    expect(Object.keys(output.author)).toStrictEqual(['name', 'email', 'url', 'z'])
    expect(Object.keys(output.maintainers[0] as object)).toStrictEqual([
      'name',
      'email',
      'url',
    ])
    expect(output.maintainers[1]).toBe('string person')
    expect(Object.keys(output.contributors[0])).toStrictEqual(['name', 'email'])
    expect(Object.keys(output.directories)).toStrictEqual([
      'lib',
      'bin',
      'man',
      'doc',
      'example',
      'test',
      'extra',
    ])
    expect(Object.keys(output.binary)).toStrictEqual([
      'module_name',
      'module_path',
      'remote_path',
      'package_name',
      'host',
      'z',
    ])
    expect(Object.keys(output.badges[0])).toStrictEqual([
      'description',
      'url',
      'href',
      'extra',
    ])
    expect(Object.keys(output.volta)).toStrictEqual(['node', 'npm', 'yarn', 'z'])
    expect(Object.keys(output.devEngines.packageManager)).toStrictEqual([
      'name',
      'version',
      'onFail',
      'extra',
    ])
    expect(Object.keys(output.devEngines.runtime)).toStrictEqual(['z', 'a'])
  })

  it.each([
    'bin',
    'contributes',
    'commitlint',
    'config',
    'nodemonConfig',
    'browserify',
    'babel',
    'xo',
    'npmpkgjsonlint',
    'npmPackageJsonLintConfig',
    'npmpackagejsonlint',
    'release',
    'remarkConfig',
    'ava',
    'jest',
    'jest-junit',
    'jest-stare',
    'mocha',
    'nyc',
    'c8',
    'tap',
    'resolutions',
    'engines',
    'engineStrict',
    'preferGlobal',
    'publishConfig',
    'galleryBanner',
  ])('sorts %s shallowly with lexicographic comparison', field => {
    const nested = { z: 1, a: 2 }
    const output = sortPackageJson({ [field]: { z: nested, a10: 1, a2: 2, A: 3 } })
    expect(Object.keys(output[field])).toStrictEqual(['A', 'a10', 'a2', 'z'])
    expect(output[field]['z']).toBe(nested)
    expect(Object.keys(nested)).toStrictEqual(['z', 'a'])
  })

  it.each(['categories', 'keywords', 'files', 'activationEvents'])(
    'deduplicates %s string arrays without reordering them',
    field => {
      const input = Object.freeze(['z', 'a', 'z'])
      expect(sortPackageJson({ [field]: input })[field]).toStrictEqual(['z', 'a'])
      expect(input).toStrictEqual(['z', 'a', 'z'])
      const mixed = ['z', 1, 'z']
      expect(sortPackageJson({ [field]: mixed })[field]).toBe(mixed)
    },
  )

  it.each([
    'bundledDependencies',
    'bundleDependencies',
    'extensionPack',
    'extensionDependencies',
  ])('deduplicates and lexicographically sorts %s string arrays', field => {
    expect(sortPackageJson({ [field]: ['z', 'a2', 'a10', 'z'] })[field]).toStrictEqual([
      'a10',
      'a2',
      'z',
    ])
    const mixed = ['z', 1, 'z']
    expect(sortPackageJson({ [field]: mixed })[field]).toBe(mixed)
  })

  it('preserves ordinary arrays, export fallback arrays, and unknown nested object order', () => {
    const input = {
      sideEffects: ['z', 'a', 'z'],
      os: ['z', 'a'],
      cpu: ['z', 'a'],
      workspaces: ['z', 'a', 'z'],
      imports: { z: 1, a: 2 },
      custom: { z: 1, a: 2 },
      exports: { '.': [{ default: 'fallback', import: 'esm' }, 'last'] },
    }
    const output = sortPackageJson(input)
    for (const field of [
      'sideEffects',
      'os',
      'cpu',
      'workspaces',
      'imports',
      'custom',
    ] as const)
      expect(output[field]).toBe(input[field])
    expect(output.exports['.']).toBe(input.exports['.'])
    expect(Object.keys(output.imports)).toStrictEqual(['z', 'a'])
    expect(Object.keys(output.custom)).toStrictEqual(['z', 'a'])
  })

  it('sorts workspace object packages and catalog but preserves nested catalog metadata', () => {
    const output = sortPackageJson({
      workspaces: {
        z: true,
        catalog: { Z: { z: 1, a: 2 }, a: '1' },
        packages: ['z', 'a', 'z'],
      },
    })
    expect(Object.keys(output.workspaces)).toStrictEqual(['packages', 'catalog', 'z'])
    expect(output.workspaces.packages).toStrictEqual(['a', 'z'])
    expect(Object.keys(output.workspaces.catalog)).toStrictEqual(['a', 'Z'])
    expect(Object.keys(output.workspaces.catalog.Z)).toStrictEqual(['z', 'a'])
  })

  it('groups nested script names and places pre/post lifecycle scripts around their base', () => {
    const output = sortPackageJson({
      scripts: {
        'build:types': '',
        'build-other': '',
        'posttest': '',
        'pretest': '',
        'test': '',
        'build:js:min': '',
        'build': '',
        'build:js': '',
        'foo': '',
        'prefoo': '',
        'postfoo': '',
        'prepublishOnly': '',
      },
    })
    expect(Object.keys(output.scripts)).toStrictEqual([
      'build',
      'build:js',
      'build:js:min',
      'build:types',
      'build-other',
      'prefoo',
      'foo',
      'postfoo',
      'prepublishOnly',
      'pretest',
      'test',
      'posttest',
    ])
    expect(
      Object.keys(
        sortPackageJson({ betterScripts: { postinstall: '', z: '', preinstall: '' } })
          .betterScripts,
      ),
    ).toStrictEqual(['preinstall', 'postinstall', 'z'])
  })

  it.each([
    'run-s task:*',
    'npm-run-all --sequential task:*',
    'npm-run-all2 --serial task:*',
    'npm-run-all -s task:*',
    'echo before && run-s task:*',
  ])('preserves script execution order for sequential wildcard command %s', command => {
    const output = sortPackageJson({
      devDependencies: { 'npm-run-all2': '1' },
      scripts: { 'task:z': '', 'all': command, 'task:a': '' },
    })
    expect(Object.keys(output.scripts)).toStrictEqual(['task:z', 'all', 'task:a'])
  })

  it('finds sequential wildcard commands in betterScripts and only guards installed runners', () => {
    const scripts = { z: '', a: 'run-s task:*' }
    expect(
      Object.keys(
        sortPackageJson({
          devDependencies: { 'npm-run-all': '1' },
          betterScripts: scripts,
          scripts: { z: '', a: '' },
        }).scripts,
      ),
    ).toStrictEqual(['z', 'a'])
    expect(Object.keys(sortPackageJson({ scripts }).scripts)).toStrictEqual(['a', 'z'])
    expect(
      Object.keys(
        sortPackageJson({
          devDependencies: { 'npm-run-all': '1' },
          scripts: { z: '', a: 'run-p task:*' },
        }).scripts,
      ),
    ).toStrictEqual(['a', 'z'])
    expect(
      Object.keys(
        sortPackageJson({
          devDependencies: { 'npm-run-all': '1' },
          scripts: { z: '', a: 'run-s task:z task:a' },
        }).scripts,
      ),
    ).toStrictEqual(['a', 'z'])
  })

  it('moves default exports last while preserving path and condition precedence recursively', () => {
    const output = sortPackageJson({
      exports: {
        'default': { default: 'd', require: 'r', import: 'i' },
        './z': { default: 'd', node: { default: 'd', custom: 'c' }, import: 'i' },
        './a': 'a',
        'custom': 'c',
        'node': 'n',
      },
    })
    expect(Object.keys(output.exports)).toStrictEqual([
      './z',
      './a',
      'custom',
      'node',
      'default',
    ])
    expect(Object.keys(output.exports['./z'])).toStrictEqual([
      'node',
      'import',
      'default',
    ])
    expect(Object.keys(output.exports['./z'].node)).toStrictEqual(['custom', 'default'])
    expect(Object.keys(output.exports.default)).toStrictEqual([
      'require',
      'import',
      'default',
    ])
  })

  it('sorts ESLint structure and scoped rules while preserving rule arrays and ordered extends', () => {
    const rule = [2, { z: 1, a: 2 }]
    const output = sortPackageJson({
      eslintConfig: {
        globals: { z: true, a: true },
        overrides: [
          {
            rules: { '@scope/plugin/z': 1, 'plugin/a': 1, 'z': rule, 'a': 1 },
            extends: ['z', 'a'],
            files: ['z', 'a'],
            env: { z: true, a: true },
          },
        ],
        rules: { 'plugin/z': 1, '@scope/plugin/a': 1, 'z': rule, 'a': 1 },
        extends: ['z', 'a'],
        plugins: ['z', 'a'],
        settings: { z: { z: 1, a: 2 }, a: true },
        parserOptions: { z: true, a: true },
        env: { z: true, a: true },
        custom: true,
      },
    })
    expect(Object.keys(output.eslintConfig)).toStrictEqual([
      'env',
      'parserOptions',
      'settings',
      'plugins',
      'extends',
      'rules',
      'overrides',
      'globals',
      'custom',
    ])
    expect(Object.keys(output.eslintConfig.rules)).toStrictEqual([
      'a',
      'z',
      'plugin/z',
      '@scope/plugin/a',
    ])
    expect(Object.keys(output.eslintConfig.overrides[0])).toStrictEqual([
      'files',
      'env',
      'extends',
      'rules',
    ])
    expect(Object.keys(output.eslintConfig.overrides[0].rules)).toStrictEqual([
      'a',
      'z',
      'plugin/a',
      '@scope/plugin/z',
    ])
    for (const value of [
      output.eslintConfig.env,
      output.eslintConfig.globals,
      output.eslintConfig.settings,
      output.eslintConfig.parserOptions,
    ])
      expect(Object.keys(value)).toStrictEqual(['a', 'z'])
    expect(output.eslintConfig.rules.z).toBe(rule)
    expect(output.eslintConfig.extends).toStrictEqual(['z', 'a'])
    expect(Object.keys(output.eslintConfig.settings.z)).toStrictEqual(['z', 'a'])
  })

  it('places Prettier overrides last and sorts each override options without changing array order', () => {
    const output = sortPackageJson({
      prettier: {
        overrides: [
          { options: { z: true, a: true }, files: ['z', 'a'] },
          { files: 'last', options: { z: true, a: true } },
        ],
        z: true,
        a: true,
      },
    })
    expect(Object.keys(output.prettier)).toStrictEqual(['a', 'z', 'overrides'])
    expect(Object.keys(output.prettier.overrides[0])).toStrictEqual([
      'files',
      'options',
    ])
    expect(Object.keys(output.prettier.overrides[0].options)).toStrictEqual(['a', 'z'])
    expect(output.prettier.overrides[0].files).toStrictEqual(['z', 'a'])
    expect(output.prettier.overrides[1].files).toBe('last')
  })

  it('sorts wireit scripts, dependency records, environment, and service structure', () => {
    const output = sortPackageJson({
      wireit: {
        z: {
          service: { z: true, readyWhen: { z: true, a: true } },
          env: { Z: { default: '', external: true, z: '' }, A: 'plain' },
          output: ['z', 'a'],
          files: ['z', 'a'],
          dependencies: [{ cascade: false, script: 'z', z: true }, 'a'],
          command: 'run',
        },
        a: { command: 'first' },
      },
    })
    expect(Object.keys(output.wireit)).toStrictEqual(['a', 'z'])
    expect(Object.keys(output.wireit.z)).toStrictEqual([
      'command',
      'dependencies',
      'files',
      'output',
      'env',
      'service',
    ])
    expect(Object.keys(output.wireit.z.dependencies[0] as object)).toStrictEqual([
      'script',
      'cascade',
      'z',
    ])
    expect(output.wireit.z.dependencies[1]).toBe('a')
    expect(Object.keys(output.wireit.z.env)).toStrictEqual(['A', 'Z'])
    expect(Object.keys(output.wireit.z.env.Z)).toStrictEqual([
      'external',
      'default',
      'z',
    ])
    expect(Object.keys(output.wireit.z.service)).toStrictEqual(['readyWhen', 'z'])
    expect(Object.keys(output.wireit.z.service.readyWhen)).toStrictEqual(['a', 'z'])
    expect(output.wireit.z.files).toStrictEqual(['z', 'a'])
  })

  it('uses git lifecycle ordering for hooks without sorting unrelated husky settings', () => {
    const hooks = {
      'pre-push': '',
      'z': '',
      'commit-msg': '',
      'post-commit': '',
      'pre-commit': '',
      'applypatch-msg': '',
    }
    const output = sortPackageJson({
      'husky': { z: true, hooks, a: true },
      'simple-git-hooks': hooks,
    })
    expect(Object.keys(output['simple-git-hooks'])).toStrictEqual([
      'applypatch-msg',
      'pre-commit',
      'commit-msg',
      'post-commit',
      'pre-push',
      'z',
    ])
    expect(Object.keys(output.husky.hooks)).toStrictEqual([
      'applypatch-msg',
      'pre-commit',
      'commit-msg',
      'post-commit',
      'pre-push',
      'z',
    ])
    expect(Object.keys(output.husky)).toStrictEqual(['z', 'hooks', 'a'])
  })

  it.each([
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
    'overrides',
  ])(
    'sorts %s according to explicit package manager without recursively sorting versions',
    field => {
      const dependencies = {
        'z': '*',
        'Z': '*',
        'a': '*',
        'a-b': '*',
        'a_b': { z: 1, a: 2 },
        'B': '*',
      }
      expect(
        Object.keys(
          sortPackageJson({ packageManager: 'npm@11', [field]: dependencies })[field],
        ),
      ).toStrictEqual(['a', 'a_b', 'a-b', 'B', 'z', 'Z'])
      expect(
        Object.keys(
          sortPackageJson({ packageManager: 'yarn@4', [field]: dependencies })[field],
        ),
      ).toStrictEqual(['B', 'Z', 'a', 'a-b', 'a_b', 'z'])
      const pnpm = sortPackageJson({ packageManager: 'pnpm@10', [field]: dependencies })
      expect(Object.keys((pnpm[field] as typeof dependencies)['a_b'])).toStrictEqual([
        'z',
        'a',
      ])
    },
  )

  it('honors package-manager detection precedence before cwd fallback', async () => {
    const cwd = await directory()
    await writeFile(join(cwd, 'yarn.lock'), '')
    const dependencies = { Z: '*', a: '*' }
    expect(
      Object.keys(
        sortPackageJson(
          {
            packageManager: 'npm@11',
            devEngines: { packageManager: { name: 'yarn' } },
            pnpm: {},
            dependencies,
          },
          { cwd },
        ).dependencies,
      ),
    ).toStrictEqual(['a', 'Z'])
    expect(
      Object.keys(
        sortPackageJson(
          {
            devEngines: { packageManager: { name: 'yarn' } },
            engines: { npm: '*' },
            dependencies,
          },
          { cwd },
        ).dependencies,
      ),
    ).toStrictEqual(['Z', 'a'])
    expect(
      Object.keys(
        sortPackageJson({ pnpm: {}, engines: { npm: '*' }, dependencies }, { cwd })
          .dependencies,
      ),
    ).toStrictEqual(['Z', 'a'])
    expect(
      Object.keys(
        sortPackageJson({ engines: { npm: '*' }, dependencies }, { cwd }).dependencies,
      ),
    ).toStrictEqual(['a', 'Z'])
  })

  it.each([
    'yarn.lock',
    '.yarn',
    '.yarnrc.yml',
    'pnpm-lock.yaml',
    'pnpm-workspace.yaml',
  ])('detects %s in the supplied cwd without changing process cwd', async marker => {
    const cwd = await directory()
    const before = process.cwd()
    const input = { dependencies: { Z: '*', a: '*' } }
    expect(Object.keys(sortPackageJson(input, { cwd }).dependencies)).toStrictEqual([
      'a',
      'Z',
    ])
    await createMarker(cwd, marker)
    expect(Object.keys(sortPackageJson(input, { cwd }).dependencies)).toStrictEqual([
      'Z',
      'a',
    ])
    expect(process.cwd()).toBe(before)
  })

  it('does not detect a regular .yarn file as a Yarn directory', async () => {
    const cwd = await directory()
    await writeFile(join(cwd, '.yarn'), '')
    expect(
      Object.keys(
        sortPackageJson({ dependencies: { Z: '*', a: '*' } }, { cwd }).dependencies,
      ),
    ).toStrictEqual(['a', 'Z'])
  })

  it('sorts dependency metadata by package identity and recurses only through objects', () => {
    const output = sortPackageJson({
      dependenciesMeta: {
        'z@1': { z: { z: 1, a: 2 }, a: true },
        '@scope/a@2': { z: true, a: true },
        'a@2': {},
        'a@1': {},
      },
      peerDependenciesMeta: { z: { z: { z: 1, a: 2 }, a: true }, a: ['z', 'a'] },
      oclif: { z: { z: 1, a: 2 }, a: [{ z: 1, a: 2 }] },
    })
    expect(Object.keys(output.dependenciesMeta)).toStrictEqual([
      '@scope/a@2',
      'a@2',
      'a@1',
      'z@1',
    ])
    expect(Object.keys(output.dependenciesMeta['z@1'])).toStrictEqual(['a', 'z'])
    expect(Object.keys(output.dependenciesMeta['z@1'].z)).toStrictEqual(['a', 'z'])
    expect(Object.keys(output.peerDependenciesMeta)).toStrictEqual(['a', 'z'])
    expect(Object.keys(output.peerDependenciesMeta.z.z)).toStrictEqual(['a', 'z'])
    expect(Object.keys(output.oclif.z)).toStrictEqual(['a', 'z'])
    expect(Object.keys(output.oclif.a[0])).toStrictEqual(['z', 'a'])
  })

  it('sorts pnpm structure recursively and compares scoped override version ranges numerically', () => {
    const output = sortPackageJson({
      pnpm: {
        packageExtensions: { z: { z: true, a: true }, a: true },
        overrides: {
          'foo@^10': 'a',
          'foo@^2': 'b',
          '@scope/foo@>=1': 'c',
          'foo': 'd',
          'bar@^1': 'e',
          'foo@^2>bar': 'f',
        },
        supportedArchitectures: { z: true, a: true },
        neverBuiltDependencies: ['z', 'a'],
        peerDependencyRules: { z: true, a: true },
        z: { overrides: true, peerDependencyRules: true, a: true },
      },
    })
    expect(Object.keys(output.pnpm)).toStrictEqual([
      'peerDependencyRules',
      'neverBuiltDependencies',
      'supportedArchitectures',
      'overrides',
      'packageExtensions',
      'z',
    ])
    expect(Object.keys(output.pnpm.overrides)).toStrictEqual([
      '@scope/foo@>=1',
      'bar@^1',
      'foo',
      'foo@^2',
      'foo@^2>bar',
      'foo@^10',
    ])
    expect(Object.keys(output.pnpm.z)).toStrictEqual([
      'peerDependencyRules',
      'overrides',
      'a',
    ])
    expect(Object.keys(output.pnpm.packageExtensions.z)).toStrictEqual(['a', 'z'])
    expect(output.pnpm.neverBuiltDependencies).toStrictEqual(['z', 'a'])
  })

  it.each(['foo@invalid', 'foo@>invalid'])(
    'rejects invalid pnpm override range %s rather than silently applying a different ordering',
    specifier => {
      expect(() =>
        sortPackageJson({ pnpm: { overrides: { [specifier]: '1', 'foo@^2': '2' } } }),
      ).toThrow()
    },
  )

  it('compares greater-than override ranges instead of treating them as parent separators', () => {
    const output = sortPackageJson({
      pnpm: { overrides: { 'foo@>10': 'a', 'foo@>=10': 'b', 'foo@^2': 'c' } },
    })
    expect(Object.keys(output.pnpm.overrides)).toStrictEqual([
      'foo@^2',
      'foo@>=10',
      'foo@>10',
    ])
  })

  it('compares parent override ranges while ignoring child selectors containing greater-than ranges', () => {
    const output = sortPackageJson({
      pnpm: {
        overrides: {
          'parent@>10>child@>=10': 'a',
          'parent@>=10>child@^1': 'b',
          'parent@^2>child@>100': 'c',
          'parent@^1>child@>=10': 'd',
        },
      },
    })
    expect(Object.keys(output.pnpm.overrides)).toStrictEqual([
      'parent@^1>child@>=10',
      'parent@^2>child@>100',
      'parent@>=10>child@^1',
      'parent@>10>child@>=10',
    ])
  })

  it('recognizes range comparators after whitespace and parent selectors surrounded by whitespace', () => {
    const output = sortPackageJson({
      pnpm: {
        overrides: {
          'foo@> 10': 'a',
          'foo@^2 || >10': 'b',
          'foo@>=1': 'c',
          'parent@>=10 > child@^1': 'd',
          'parent@^2 > child@>=100': 'e',
        },
      },
    })
    expect(Object.keys(output.pnpm.overrides)).toStrictEqual([
      'foo@>=1',
      'foo@^2 || >10',
      'foo@> 10',
      'parent@^2 > child@>=100',
      'parent@>=10 > child@^1',
    ])
  })
})
