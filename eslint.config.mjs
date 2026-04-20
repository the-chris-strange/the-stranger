import nx from '@nx/eslint-plugin'
import vitest from '@vitest/eslint-plugin'
import prettierConfig from 'eslint-config-prettier'
import jsdoc from 'eslint-plugin-jsdoc'
import jsonc from 'eslint-plugin-jsonc'
import n from 'eslint-plugin-n'
import perfectionist from 'eslint-plugin-perfectionist'
import promise from 'eslint-plugin-promise'
import re from 'eslint-plugin-regexp'
import unicorn from 'eslint-plugin-unicorn'
import yml from 'eslint-plugin-yml'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

/**
 * Array of file patterns matching JavaScript (but not TypeScript) files.
 * @example *.js, *.mjs
 */
export const JS_FILES = ['*.{js,mjs,cjs,jsx}', '**/*.{js,mjs,cjs,jsx}']

/**
 * Array of file patterns matching TypeScript (but not JavaScript) files.
 * @example *.ts, *.tsx
 */
export const TS_FILES = ['*.{ts,mts,cts,tsx}', '**/*.{ts,mts,cts,tsx}']

/**
 * Array of file patterns matching test files.
 * @example *.spec.ts, *.test.jsx
 */
export const TEST_FILES = ['**/*.{spec,test}.{js,jsx,ts,tsx}']

/**
 * Array of file patterns matching all source files.
 */
export const SOURCE_FILES = [...JS_FILES, ...TS_FILES]

export const disableTypeChecked = defineConfig({
  name: tseslint.configs.disableTypeChecked.name,
  rules: tseslint.configs.disableTypeChecked.rules,
})

const sourceFilesConfig = defineConfig(
  {
    plugins: {
      '@nx': nx,
    },
  },

  {
    name: 'base config for JavaScript files',
    files: JS_FILES,
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  {
    name: 'general-purpose config for source code',
    files: SOURCE_FILES,
    extends: [
      perfectionist.configs['recommended-natural'],
      tseslint.configs['recommended'],
      unicorn.configs['unopinionated'],
      jsdoc.configs['flat/recommended'],
      re.configs['flat/recommended'],
      promise.configs['flat/recommended'],
    ],
    plugins: {
      n,
      jsdoc,
    },
    settings: {
      jsdoc: {
        tagNamePreference: {
          augments: 'extends',
        },
      },
    },
  },

  {
    name: 'base config for TypeScript files',
    files: TS_FILES,
    extends: [
      tseslint.configs['recommendedTypeCheckedOnly'],
      jsdoc.configs['flat/recommended-typescript'],
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-deprecated': 'warn',
      '@typescript-eslint/prefer-return-this-type': 'error',
      '@typescript-eslint/no-extraneous-class': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },

  {
    name: 'override rules for all source files',
    files: SOURCE_FILES,
    rules: {
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-returns': ['warn', { checkGetters: false }],

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

      'perfectionist/sort-exports': 'warn',
      'perfectionist/sort-named-imports': 'warn',
      'perfectionist/sort-intersection-types': 'warn',
      'perfectionist/sort-objects': 'warn',
      'perfectionist/sort-object-types': 'warn',
      'perfectionist/sort-interfaces': [
        'warn',
        {
          groups: [
            'unknown',
            'index-signature',
            'required-property',
            'required-multiline-property',
            'optional-property',
            'optional-multiline-property',
            'required-method',
            'optional-method',
            'required-multiline-method',
            'optional-multiline-method',
          ],
        },
      ],
      'perfectionist/sort-imports': [
        'warn',
        {
          groups: [
            ['side-effect', 'side-effect-style'],
            'style',
            'value-builtin',
            'value-external',
            'type-import',
            'type-internal',
            'value-internal',
            ['type-parent', 'type-sibling', 'type-index'],
            ['value-parent', 'value-sibling', 'value-index'],
            'ts-equals-import',
            'unknown',
          ],
        },
      ],
      'perfectionist/sort-enums': ['warn', { type: 'natural', sortByValue: 'never' }],
      'perfectionist/sort-union-types': [
        'warn',
        {
          type: 'natural',
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
      'perfectionist/sort-named-exports': [
        'warn',
        { groups: ['value-export', 'type-export'] },
      ],
      'perfectionist/sort-classes': [
        'warn',
        {
          groups: [
            'static-property',
            'property',
            'protected-static-property',
            'protected-property',
            'private-static-property',
            'private-property',
            'constructor',
            'index-signature',
            'static-accessor-property',
            'accessor-property',
            ['static-method', 'static-function-property'],
            ['method', 'function-property'],
            ['static-get-method', 'static-set-method'],
            ['get-method', 'set-method'],
            'override-method',
            'static-block',
            ['protected-static-method', 'protected-static-function-property'],
            ['protected-method', 'protected-function-property'],
            ['private-static-method', 'private-static-function-property'],
            ['private-method', 'private-function-property'],
            'protected-static-accessor-property',
            'protected-accessor-property',
            'private-static-accessor-property',
            'private-accessor-property',
            ['protected-static-get-method', 'protected-static-set-method'],
            ['protected-get-method', 'protected-set-method'],
            ['private-static-get-method', 'private-static-set-method'],
            ['private-get-method', 'private-set-method'],
            'unknown',
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

      'promise/no-multiple-resolved': 'warn',
      'promise/prefer-await-to-callbacks': 'warn',
      'promise/prefer-await-to-then': 'warn',
      'promise/spec-only': 'error',

      'unicorn/no-array-reverse': 'off',
      'unicorn/no-array-sort': 'off',
      'unicorn/prevent-abbreviations': 'off',
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

      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['eslint.config.*'],
          depConstraints: [
            {
              sourceTag: 'npm:public',
              onlyDependOnLibsWithTags: ['npm:public'],
            },
          ],
        },
      ],

      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/parameter-properties': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  {
    files: TEST_FILES,
    extends: [vitest.configs['recommended']],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',

      'unicorn/no-nested-ternary': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-useless-undefined': [
        'error',
        { checkArrowFunctionBody: false, checkArguments: false },
      ],
      'unicorn/consistent-function-scoping': 'off',

      'vitest/consistent-test-it': ['warn', { fn: 'it' }],
      'vitest/valid-title': ['warn', { disallowedWords: ['should'] }],
      'vitest/prefer-hooks-in-order': 'warn',
    },
  },

  {
    name: 'disable object sort for config files',
    files: ['eslint.config.*', 'prettier.config.mjs', 'yarn.config.cjs'],
    rules: {
      'perfectionist/sort-objects': 'off',
    },
  },

  {
    name: 'allow CommonJS in explicit cjs modules',
    files: ['**/*.cjs', '**/*.cts'],
    rules: {
      'unicorn/prefer-module': 'off',
    },
  },

  {
    name: 'allow PascalCase or kebab-case for React files',
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

  prettierConfig,
)

const ymlConfig = defineConfig(
  {
    files: ['*.{yml,yaml}', '**/*.{yml,yaml}'],
    extends: [yml.configs['flat/standard']],
  },

  {
    files: ['cspell.config.yaml', '**/cspell.config.yaml'],
    rules: {
      'yml/sort-keys': [
        'warn',
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
        'warn',
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
        'warn',
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
        'warn',
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
        'warn',
        { order: ['ignores', { order: { type: 'asc' } }], pathPattern: '^$' },
        { order: { type: 'asc' }, pathPattern: '^configs' },
      ],
      'yml/sort-sequence-values': [
        'warn',
        { order: { type: 'asc' }, pathPattern: '^ignores' },
      ],
    },
  },

  {
    files: ['.yarnrc.yml'],
    rules: {
      'yml/sort-keys': ['warn', { order: { type: 'asc' }, pathPattern: '^$' }],
      'yml/sort-sequence-values': [
        'warn',
        {
          order: ['.env?', { order: { type: 'asc' } }],
          pathPattern: '^injectEnvironmentFiles',
        },
      ],
    },
  },
)

const jsonConfig = defineConfig(
  jsonc.configs['base'],

  {
    files: ['.vscode/settings.json'],
    rules: {
      'jsonc/sort-array-values': [
        'warn',
        {
          order: { type: 'asc' },
          pathPattern: String.raw`(eslint\.(probe|validate))|(npm\.exclude)`,
        },
      ],
      'jsonc/sort-keys': ['warn', { order: { type: 'asc' }, pathPattern: '^' }],
    },
  },

  {
    files: ['.vscode/extensions.json'],
    rules: {
      'jsonc/sort-array-values': [
        'warn',
        { order: { type: 'asc' }, pathPattern: '^recommendations$' },
      ],
    },
  },

  {
    files: ['.vscode/launch.json', '.vscode/tasks.json'],
    rules: {
      'jsonc/sort-keys': [
        'warn',
        { order: ['version', { order: { type: 'asc' } }], pathPattern: '^$' },
        {
          pathPattern: String.raw`^tasks\[\d+\]`,
          order: ['label', 'detail', 'command', 'args', { order: { type: 'asc' } }],
        },
        { order: { type: 'asc' }, pathPattern: '^' },
      ],
    },
  },

  {
    files: ['nx.json'],
    rules: {
      'jsonc/sort-keys': [
        'warn',
        { order: { type: 'asc' }, pathPattern: '^plugins.+options' },
        { order: ['plugin', 'options'], pathPattern: '^plugins' },
        { order: { type: 'asc' }, pathPattern: '^' },
      ],
    },
  },

  {
    files: ['executors.json', 'generators.json'],
    rules: {
      'jsonc/sort-keys': ['warn', { order: { type: 'asc' }, pathPattern: '^' }],
    },
  },

  {
    files: ['project.json'],
    rules: {
      'jsonc/sort-array-values': [
        'warn',
        { order: { type: 'asc' }, pathPattern: '^tags' },
      ],
      'jsonc/sort-keys': [
        'warn',
        {
          order: [
            'executor',
            'inputs',
            'outputs',
            'options',
            { order: { type: 'asc' } },
          ],
          pathPattern: 'targets.+',
        },
        {
          order: [
            'name',
            '$schema',
            'projectType',
            'sourceRoot',
            'tags',
            'targets',
            { order: { type: 'asc' } },
          ],
          pathPattern: '^$',
        },
        { order: { type: 'asc' }, pathPattern: '^' },
      ],
    },
  },

  {
    files: ['tsconfig.json', 'tsconfig.*.json'],
    rules: {
      'jsonc/sort-keys': [
        'warn',
        {
          order: [
            'extends',
            'compilerOptions',
            'files',
            'include',
            'exclude',
            'references',
            { order: { type: 'asc' } },
          ],
          pathPattern: '^$',
        },
        {
          order: ['paths', { order: { type: 'asc' } }],
          pathPattern: '^compilerOptions$',
        },
        {
          order: [{ order: { type: 'asc' } }],
          pathPattern: String.raw`^compilerOptions\.paths$`,
        },
      ],
    },
  },
)

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
      'pnpm-lock.yaml',
      'pnpm-workspace.yaml',
      'tmp',
    ],
  },

  sourceFilesConfig,
  ymlConfig,
  jsonConfig,
)
