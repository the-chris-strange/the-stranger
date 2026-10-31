import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const workspaceRoot = resolve(import.meta.dirname, '..')
/** @type {{ compilerOptions: { paths: Record<string, string[]> } }} */
const { compilerOptions } = JSON.parse(
  readFileSync(resolve(workspaceRoot, 'tsconfig.base.json'), 'utf8'),
)

// Resolve workspace sources in tests; published exports point at compiled files.
export const workspaceAliases = Object.entries(compilerOptions.paths)
  .sort(([left], [right]) => right.length - left.length)
  .map(([find, [path]]) => ({ find, replacement: resolve(workspaceRoot, path) }))
