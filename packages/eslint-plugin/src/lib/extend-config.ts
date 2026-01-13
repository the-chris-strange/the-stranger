import { defineConfig } from 'eslint/config'

import type { Linter } from 'eslint'

export function extendConfig(...configs: (Linter.Config | Linter.Config[])[]) {
  const base: Linter.Config[] = [
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
        'pnpm-lock.yaml',
        'pnpm-workspace.yaml',
        'tmp',
      ],
    },

    { linterOptions: { reportUnusedDisableDirectives: 'error' } },
  ]

  return defineConfig(configs, base) as Linter.Config[]
}
