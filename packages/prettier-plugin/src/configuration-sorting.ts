import type { SortOptions } from '@the-stranger/ordered'

// Keep these file and path orders equivalent to eslint-config's opt-in data presets.
interface FilePolicy {
  arrays: [RegExp, 'asc' | string[]][]
  files: string[]
  // The optional third value preserves fields omitted by a rule without a catchall.
  keys: [RegExp, 'asc' | string[], boolean?][]
}

const policies: FilePolicy[] = [
  {
    arrays: [],
    files: ['nx.json'],
    keys: [
      [/^plugins.+options/, 'asc'],
      [/^plugins/, ['plugin', 'options'], true],
      [
        /^targetDefaults.+/,
        ['cache', 'dependsOn', 'executor', 'inputs', 'outputs', 'options'],
      ],
      [/^/, 'asc'],
    ],
  },
  {
    arrays: [],
    files: ['executors.json', 'generators.json'],
    keys: [[/^/, 'asc']],
  },
  {
    arrays: [[/^tags/, 'asc']],
    files: ['project.json'],
    keys: [
      [
        /^targets.+/,
        ['cache', 'dependsOn', 'executor', 'inputs', 'outputs', 'options'],
      ],
      [
        /^$/,
        ['$schema', 'name', 'projectType', 'root', 'sourceRoot', 'tags', 'targets'],
      ],
      [/^/, 'asc'],
    ],
  },
  {
    arrays: [],
    files: ['tsconfig.json', 'tsconfig.*.json'],
    keys: [
      [
        /^$/,
        ['extends', 'compilerOptions', 'files', 'include', 'exclude', 'references'],
      ],
      [/^compilerOptions$/, ['paths']],
      [/^compilerOptions\.paths$/, []],
    ],
  },
  {
    arrays: [[/(eslint\.(probe|validate))|(npm\.exclude)/, 'asc']],
    files: ['.vscode/settings.json'],
    keys: [[/^/, 'asc']],
  },
  {
    arrays: [[/^recommendations$/, 'asc']],
    files: ['.vscode/extensions.json'],
    keys: [],
  },
  {
    arrays: [],
    files: ['.vscode/launch.json', '.vscode/tasks.json'],
    keys: [
      [/^$/, ['version']],
      [/^tasks\[\d+\]/, ['label', 'detail', 'command', 'args']],
      [/^/, 'asc'],
    ],
  },
  {
    arrays: [[/dictionaries|import|ignorePaths|ignoreWords|words$/, 'asc']],
    files: ['cspell.config.yaml'],
    keys: [
      [
        /^$/,
        [
          'version',
          'language',
          'import',
          'ignorePaths',
          'dictionaries',
          'ignoreWords',
          'words',
          'languageSettings',
        ],
      ],
      [/languageSettings$/, ['languageId', 'dictionaries']],
    ],
  },
  {
    arrays: [],
    files: ['.github/dependabot.yml'],
    keys: [
      [/^updates/, ['package-ecosystem']],
      [/^$/, ['version', 'updates'], true],
    ],
  },
  {
    arrays: [[/^on|permissions|defaults/, 'asc']],
    files: ['.github/workflows/*.yml'],
    keys: [
      [/^$/, ['name', 'on', 'permissions', 'env', 'defaults', 'concurrency', 'jobs']],
      [/^on|permissions|defaults/, 'asc'],
      [/^jobs\..+steps/, ['id', 'name', 'if', 'run', 'uses', 'with', 'env']],
      [
        /^jobs/,
        [
          'strategy',
          'name',
          'if',
          'needs',
          'runs-on',
          'permissions',
          'environment',
          'env',
          'concurrency',
          'timeout-minutes',
          'outputs',
          'defaults',
          'steps',
        ],
      ],
    ],
  },
  {
    arrays: [[/^ignores/, 'asc']],
    files: ['.markdownlint-cli2.yaml'],
    keys: [
      [/^$/, ['ignores']],
      [/^configs/, 'asc'],
    ],
  },
  {
    arrays: [[/^injectEnvironmentFiles/, ['.env?']]],
    files: ['.yarnrc.yml'],
    keys: [[/^$/, 'asc']],
  },
]

/**
 * Resolve data-file policies without applying them to unrelated documents.
 * @param filepath the formatted file's absolute or relative path
 * @returns matching configuration rules, or undefined for ordinary data
 */
export function configurationSortOptions(filepath: string): SortOptions | undefined {
  const normalized = filepath.replaceAll('\\', '/')
  const policy = policies.find(({ files }) =>
    files.some(pattern => {
      const expression = pattern
        .split('*')
        .map(part => part.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`))
        .join('[^/]*')
      return new RegExp(`(?:^|/)${expression}$`).test(normalized)
    }),
  )

  if (!policy) {
    return undefined
  }

  return {
    arrayValues: {
      minValues: Number.MAX_SAFE_INTEGER,
      overrides: policy.arrays.toReversed().map(([pathPattern, order]) => ({
        minValues: 2,
        pathPattern,
        ...(Array.isArray(order) ? { priority: order } : { order }),
      })),
      sortType: 'lexical',
    },
    objectKeys: {
      minKeys: Number.MAX_SAFE_INTEGER,
      overrides: policy.keys
        .toReversed()
        .map(([pathPattern, order, preserveUnknownKeys = false]) => ({
          minKeys: 2,
          order,
          pathPattern,
          preserveUnknownKeys,
        })),
      sortType: 'lexical',
    },
  }
}
