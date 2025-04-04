import path from 'node:path'

import { ConfigFileExtension, ESLintConfigSchema } from './schema'

/**
 * Possible file extensions for eslint.config, in order of precedence.
 */
export const FILE_EXTENSIONS: ConfigFileExtension[] = ['ts', 'mjs', 'cjs']

export function findFileExtension(options: ESLintConfigSchema, baseConfig: string) {
  if (options.fileExtension === undefined) {
    const ext = path.extname(baseConfig).slice(1)
    if (isConfigFileExtension(ext)) {
      return ext
    }
    throw new Error(`Invalid file extension for base config: ${baseConfig}.`)
  }
  return options.fileExtension
}

function isConfigFileExtension(value: unknown): value is ConfigFileExtension {
  return typeof value === 'string' && FILE_EXTENSIONS.includes(value as any)
}
