import nx from '@nx/eslint-plugin'
import vitest from '@vitest/eslint-plugin'
import jsdoc from 'eslint-plugin-jsdoc'
import n from 'eslint-plugin-n'
import perfectionist from 'eslint-plugin-perfectionist'
import promise from 'eslint-plugin-promise'
import re from 'eslint-plugin-regexp'
import unicorn from 'eslint-plugin-unicorn'
import yml from 'eslint-plugin-yml'
import { defineConfig } from 'eslint/config'

/**
 * Array of file patterns matching JavaScript (but not TypeScript) files.
 * @example *.js, *.mjs
 */
const JS_FILES = ['*.{js,mjs,cjs,jsx}', '**/*.{js,mjs,cjs,jsx}']

/**
 * Array of file patterns matching TypeScript (but not JavaScript) files.
 * @example *.ts, *.tsx
 */
const TS_FILES = ['*.{ts,mts,cts,tsx}', '**/*.{ts,mts,cts,tsx}']

/**
 * Array of file patterns matching test files.
 * @example *.spec.ts, *.test.jsx
 */
const TEST_FILES = ['**/*.{spec,test}.{js,jsx,ts,tsx}']

/**
 * Array of file patterns matching all source files.
 */
export const SOURCE_FILES = [...JS_FILES, ...TS_FILES]

/**
 * Rules for 'eslint-plugin-perfectionist'.
 */
const perfectionistConfig = defineConfig(
  perfectionist.configs['recommended-natural'],

  {
    files: SOURCE_FILES,
    rules: {
      'perfectionist/sort-imports': [
        'warn',
        {
          type: 'natural',
          newlinesBetween: 'always',
          groups: [
            ['side-effect', 'side-effect-style'],
            'builtin',
            'external',
            'type',
            'internal-type',
            'internal',
            ['parent-type', 'sibling-type', 'index-type'],
            ['parent', 'sibling', 'index'],
            'object',
            'unknown',
          ],
        },
      ],
      'perfectionist/sort-enums': [
        'warn',
        {
          forceNumericSort: true,
        },
      ],
      'perfectionist/sort-union-types': [
        'warn',
        {
          ignoreCase: false,
          groups: [
            'conditional',
            'function',
            'operator',
            'literal',
            'keyword',
            'named',
            'import',
            'tuple',
            'object',
            ['intersection', 'union'],
            'nullish',
            'unknown',
          ],
        },
      ],
      'perfectionist/sort-exports': [
        'warn',
        {
          type: 'natural',
        },
      ],
      'perfectionist/sort-named-imports': [
        'warn',
        {
          type: 'natural',
        },
      ],
      'perfectionist/sort-named-exports': [
        'warn',
        {
          type: 'natural',
          groupKind: 'values-first',
        },
      ],
      'perfectionist/sort-interfaces': 'off',
      'perfectionist/sort-classes': [
        'warn',
        {
          groups: [
            'constructor',
            'index-signature',
            'static-block',
            'accessor-property',
            ['get-method', 'set-method'],
            'method',
            'override-method',
            'static-method',
            'protected-method',
            'private-method',
            'protected-accessor-property',
            'private-accessor-property',
            ['private-get-method', 'private-set-method'],
          ],
        },
      ],
      'perfectionist/sort-modules': [
        'warn',
        {
          groups: [
            'unknown',
            'export-class',
            'export-function',
            'export-enum',
            ['export-interface', 'export-type'],
            'class',
            'function',
            'enum',
            ['interface', 'type'],
            [
              'export-default-class',
              'export-default-function',
              'export-default-enum',
              'export-default-type',
              'export-default-interface',
            ],
          ],
        },
      ],
    },
  },

  {
    files: [
      'eslint.config.ts',
      'eslint.config.mjs',
      'prettier.config.mjs',
      'yarn.config.cjs',
    ],
    rules: {
      'perfectionist/sort-objects': 'off',
    },
  },
)

/**
 * Configuration objects for 'eslint-plugin-unicorn'.
 */
const unicornConfig = defineConfig(
  unicorn.configs['recommended'],

  {
    files: SOURCE_FILES,
    rules: {
      'unicorn/no-array-reverse': 'off',
      'unicorn/no-array-sort': 'off',
      'unicorn/custom-error-definition': 'warn',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/prefer-math-trunc': 'off',
      'unicorn/import-style': 'off',
      'unicorn/numeric-separators-style': [
        'warn',
        {
          number: {
            minimumDigits: 12,
          },
        },
      ],
    },
  },

  {
    files: ['**/*'],
    rules: {
      'unicorn/prevent-abbreviations': 'off',
    },
  },

  {
    files: ['**/*.cjs', '**/*.cts'],
    rules: {
      'unicorn/prefer-module': 'off',
    },
  },

  {
    files: ['**/*.tsx', '**/*.jsx'],
    rules: {
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            pascalCase: true,
            kebabCase: true,
          },
        },
      ],
    },
  },

  {
    files: TEST_FILES,
    rules: {
      'unicorn/no-nested-ternary': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-useless-undefined': [
        'error',
        { checkArrowFunctionBody: false, checkArguments: false },
      ],
      'unicorn/consistent-function-scoping': 'off',
    },
  },
)

/**
 * Configuration objects for 'eslint-plugin-jsdoc'.
 */
const jsdocConfig = defineConfig(
  { plugins: { jsdoc } },

  {
    files: TS_FILES,
    rules: jsdoc.configs['flat/recommended-typescript'].rules,
  },

  {
    files: JS_FILES,
    rules: jsdoc.configs['flat/recommended'].rules,
  },

  {
    files: SOURCE_FILES,
    rules: {
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-returns': [
        'error',
        {
          checkGetters: false,
        },
      ],
      'jsdoc/check-tag-names': ['warn', { definedTags: ['document'] }],
    },
  },
)

/**
 * Configuration objects for the typescript-eslint plugin.
 */
const tsEslintConfig = defineConfig(
  {
    files: SOURCE_FILES,
    rules: {
      // unnecessary; ts language server covers this
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: TEST_FILES,
    rules: { '@typescript-eslint/no-non-null-assertion': 'off' },
  },
)

/**
 * Configuration objects for nx.
 */
const nxConfig = defineConfig(
  nx.configs['flat/base'],
  nx.configs['flat/typescript'],
  nx.configs['flat/javascript'],

  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
)

/**
 * Configuration objects for '@vitest/eslint-plugin'.
 */
const vitestConfig = defineConfig(
  vitest.configs['recommended'],

  {
    files: TEST_FILES,
    rules: {
      'vitest/consistent-test-it': ['warn', { fn: 'it' }],
      'vitest/valid-title': ['warn', { disallowedWords: ['should'] }],
      'vitest/prefer-hooks-in-order': 'warn',
    },
  },
)

const nConfig = defineConfig(
  { plugins: { n } },

  {
    files: SOURCE_FILES,
    rules: {
      'n/exports-style': ['error', 'module.exports'],
      'n/hashbang': 'error',
      'n/no-deprecated-api': 'error',
      'n/no-process-exit': 'error',
      'n/prefer-node-protocol': 'error',
      'n/prefer-global/buffer': ['error', 'always'],
      'n/prefer-global/console': ['error', 'always'],
      'n/prefer-global/process': ['error', 'always'],
      'n/prefer-global/text-decoder': ['error', 'never'],
      'n/prefer-global/text-encoder': ['error', 'never'],
      'n/prefer-global/url-search-params': ['error', 'never'],
      'n/prefer-global/url': ['error', 'never'],
    },
  },
)

const ymlConfig = defineConfig(
  yml.configs['flat/standard'],

  {
    files: ['cspell.config.yaml', '**/cspell.config.yaml'],
    rules: {
      'yml/sort-keys': [
        'error',
        {
          order: [
            'version',
            'language',
            'import',
            'ignorePaths',
            'dictionaries',
            'ignoreWords',
            'words',
            'languageSettings',
            { order: { type: 'asc' } },
          ],
          pathPattern: '^$',
        },
        {
          order: ['languageId', 'dictionaries', { order: { type: 'asc' } }],
          pathPattern: 'languageSettings$',
        },
      ],
      'yml/sort-sequence-values': [
        'error',
        {
          order: { type: 'asc' },
          pathPattern: 'dictionaries|import|ignorePaths|ignoreWords|words$',
        },
      ],
    },
  },

  {
    files: ['.github/workflows/*.yml'],
    rules: {
      'yml/no-empty-mapping-value': 'off',
      'yml/sort-keys': [
        'error',
        {
          order: [
            'name',
            'on',
            'permissions',
            'env',
            'defaults',
            'concurrency',
            'jobs',
            { order: { type: 'asc' } },
          ],
          pathPattern: '^$',
        },
        {
          order: { type: 'asc' },
          pathPattern: '^on|permissions|defaults',
        },
        {
          order: [
            'id',
            'name',
            'if',
            'run',
            'uses',
            'with',
            'env',
            { order: { type: 'asc' } },
          ],
          pathPattern: String.raw`^jobs\..+steps`,
        },
        {
          order: [
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
            { order: { type: 'asc' } },
          ],
          pathPattern: '^jobs',
        },
      ],
      'yml/sort-sequence-values': [
        'error',
        {
          order: { type: 'asc' },
          pathPattern: '^on|permissions',
        },
      ],
    },
  },

  {
    files: ['.markdownlint-cli2.yaml'],
    rules: {
      'yml/sort-keys': [
        'error',
        { order: ['ignores', { order: { type: 'asc' } }], pathPattern: '^$' },
        { order: { type: 'asc' }, pathPattern: '^configs' },
      ],
      'yml/sort-sequence-values': [
        'error',
        { order: { type: 'asc' }, pathPattern: '^ignores' },
      ],
    },
  },

  {
    files: ['.yarnrc.yml'],
    rules: {
      'yml/sort-keys': ['error', { order: { type: 'asc' }, pathPattern: '^$' }],
      'yml/sort-sequence-values': [
        'error',
        {
          order: ['.env?', { order: { type: 'asc' } }],
          pathPattern: '^injectEnvironmentFiles',
        },
      ],
    },
  },
)

const reConfig = defineConfig(re.configs['flat/recommended'])

const promiseConfig = defineConfig(promise.configs['flat/recommended'], {
  name: 'Additional rules for asynchronous code',
  files: SOURCE_FILES,
  rules: {
    'promise/no-multiple-resolved': 'warn',
    'promise/prefer-await-to-callbacks': 'warn',
    'promise/prefer-await-to-then': 'warn',
    'promise/spec-only': 'error',
  },
})

export default defineConfig(
  {
    ignores: [
      '.cache',
      '.nx',
      '.pnp.*',
      '.yarn',
      'coverage',
      'dist',
      'node_modules',
      'tmp',
    ],
  },

  nxConfig,
  perfectionistConfig,
  unicornConfig,
  tsEslintConfig,
  jsdocConfig,
  vitestConfig,
  nConfig,
  ymlConfig,
  reConfig,
  promiseConfig,
)
