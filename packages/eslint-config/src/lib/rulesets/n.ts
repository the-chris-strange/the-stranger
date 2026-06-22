import type { Rules } from './rules.js'

export const nRules = {
  'n/exports-style': ['error', 'module.exports'],
  'n/hashbang': ['error', { ignoreUnpublished: true }],
  'n/no-deprecated-api': 'error',
  'n/no-process-exit': 'error',
  'n/prefer-global/buffer': ['error', 'always'],
  'n/prefer-global/console': ['error', 'always'],
  'n/prefer-global/process': ['error', 'always'],
  'n/prefer-global/text-decoder': ['error', 'never'],
  'n/prefer-global/text-encoder': ['error', 'never'],
  'n/prefer-global/url': ['error', 'never'],
  'n/prefer-global/url-search-params': ['error', 'never'],
  'n/prefer-node-protocol': 'error',
} satisfies Rules
