import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { createRequire } from 'node:module'

// Preserve Yarn's optional environment-file order; existing shell variables win.
const inherited = new Set(Object.keys(process.env))
for (const path of ['.env', '.env.ci', '.env.dev', '.env.production']) {
  if (!existsSync(path)) continue
  for (const [key, value] of Object.entries(parseEnv(readFileSync(path, 'utf8')))) {
    if (!inherited.has(key)) process.env[key] = value
  }
}
const require = createRequire(import.meta.url)
const result = spawnSync(
  process.execPath,
  [require.resolve('nx/bin/nx.js'), ...process.argv.slice(2)],
  {
    stdio: 'inherit',
    env: process.env,
  },
)
if (result.error) throw result.error
process.exitCode = result.status ?? 1
