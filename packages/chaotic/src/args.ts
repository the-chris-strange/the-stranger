import type { ArgsDef } from 'citty'

export const CHAOTIC_ARGS = {
  'check': {
    alias: 'k',
    description: 'Check ordering without writing output or changing files.',
    type: 'boolean',
  },

  'config': {
    default: true,
    description: 'Load configuration; use --no-config for defaults.',
    type: 'boolean',
  },

  'config-file': {
    description: 'Require a configuration file, relative to cwd.',
    type: 'string',
  },

  'cwd': {
    description: 'Working directory for files and configuration.',
    type: 'string',
  },

  'files': {
    description: 'Input files; omit to read stdin.',
    required: false,
    type: 'positional',
  },

  'format': {
    description: 'Input format (default: detect extension, or JSON for stdin).',
    options: ['json', 'yaml', 'markdown'],
    type: 'enum',
  },

  'indent': {
    description: 'JSON indentation: an integer from 0 to 10.',
    type: 'string',
  },

  'write': {
    alias: 'w',
    description: 'Replace input files with sorted output.',
    type: 'boolean',
  },
} as const satisfies ArgsDef

export type ChaoticArgs = typeof CHAOTIC_ARGS
