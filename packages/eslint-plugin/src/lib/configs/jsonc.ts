import jsonc from 'eslint-plugin-jsonc'

import type { Linter } from 'eslint'

import { namer } from '../namer.js'

export default [
  jsonc.configs['flat/base'],

  {
    files: ['.vscode/settings.json'],
    name: namer('jsonc/vscode-settings'),
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
    name: namer('jsonc/vscode-extensions'),
    rules: {
      'jsonc/sort-array-values': [
        'warn',
        { order: { type: 'asc' }, pathPattern: '^recommendations$' },
      ],
    },
  },

  {
    files: ['.vscode/launch.json', '.vscode/tasks.json'],
    name: namer('jsonc/vscode-launch-tasks'),
    rules: {
      'jsonc/sort-keys': [
        'warn',
        { order: ['version', { order: { type: 'asc' } }], pathPattern: '^$' },
        {
          order: ['label', 'detail', 'command', 'args', { order: { type: 'asc' } }],
          pathPattern: String.raw`^tasks\[\d+\]`,
        },
        { order: { type: 'asc' }, pathPattern: '^' },
      ],
    },
  },

  {
    files: ['nx.json'],
    name: namer('jsonc/nx.json'),
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
    files: ['project.json', '**/project.json'],
    name: namer('jsonc/nx project.json'),
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
    name: namer('jsonc/tsconfig'),
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
] as Linter.Config[]
