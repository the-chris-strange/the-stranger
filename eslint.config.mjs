import nx from '@nx/eslint-plugin'
import vitest from '@vitest/eslint-plugin'
import jsdoc from 'eslint-plugin-jsdoc'
import n from 'eslint-plugin-n'
import perfectionist from 'eslint-plugin-perfectionist'
import unicorn from 'eslint-plugin-unicorn'
import tseslint from 'typescript-eslint'

/**
 * Ensure that the glob patterns provided start with `**`, so they apply to all nested files.
 * @param {string[]} patterns the patterns to globbify
 * @returns {string[]} the array of recursive glob patterns
 */
export function fileGlobs(...patterns) {
  return patterns.map(e => (e.startsWith('**/') ? e : `**/${e}`))
}

/**
 * Array of file patterns matching JavaScript (but not TypeScript) files.
 * @example *.js, *.mjs
 */
export const JS_FILES = fileGlobs('*.js', '*.jsx', '*.mjs', '*.cjs')

/**
 * Array of file patterns matching TypeScript (but not JavaScript) files.
 * @example *.ts, *.tsx
 */
export const TS_FILES = fileGlobs('*.ts', '*.tsx', '*.mts', '*.cts')

/**
 * Array of file patterns matching test files.
 * @example *.spec.ts, *.test.jsx
 */
export const TEST_FILES = ['**/*.{spec,test}.{js,jsx,ts,tsx}']

/**
 * Array of file patterns matching all source files.
 */
export const SOURCE_FILES = ['**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}']

/**
 * Rules for 'eslint-plugin-perfectionist'.
 */
const perfectionistConfig = tseslint.config(
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
const unicornConfig = tseslint.config(
  unicorn.configs['recommended'],

  {
    files: SOURCE_FILES,
    rules: {
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
    rules: { 'unicorn/consistent-function-scoping': 'off' },
  },
)

/**
 * Configuration objects for 'eslint-plugin-jsdoc'.
 */
const jsdocConfig = tseslint.config(
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
const tsEslintConfig = tseslint.config(
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
const nxConfig = tseslint.config(
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
const vitestConfig = tseslint.config(
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

const nConfig = tseslint.config(
  { plugins: { n } },

  {
    files: SOURCE_FILES,
    rules: {
      'n/no-deprecated-api': 'error',
      'n/no-process-exit': 'error',
      'n/hashbang': 'error',
      'n/prefer-node-protocol': 'error',
      'n/prefer-global/buffer': ['error', 'never'],
      'n/prefer-global/console': ['error', 'never'],
      'n/prefer-global/process': ['error', 'never'],
      'n/prefer-global/text-decoder': ['error', 'never'],
      'n/prefer-global/text-encoder': ['error', 'never'],
      'n/prefer-global/url-search-params': ['error', 'never'],
      'n/prefer-global/url': ['error', 'never'],
    },
  },
)

export default tseslint.config(
  nxConfig,
  perfectionistConfig,
  unicornConfig,
  tsEslintConfig,
  jsdocConfig,
  vitestConfig,

  {
    ignores: [
      '.cache',
      '.github',
      '.nx',
      '.pnp.*',
      '.yarn',
      'coverage',
      'dist',
      'node_modules',
      'tmp',
    ],
  },
)
