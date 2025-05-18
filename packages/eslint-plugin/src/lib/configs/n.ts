import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint'

export async function nConfig(): Promise<FlatConfig.ConfigArray> {
  try {
    const n = await import('eslint-plugin-n')
    return [n.configs['flat/recommended']]
  } catch {
    return []
  }
}

export default await nConfig()
