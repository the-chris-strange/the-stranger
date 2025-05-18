import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint'

export async function yamlConfig(): Promise<FlatConfig.ConfigArray> {
  try {
    const yml = await import('eslint-plugin-yml')
    await import('yaml-eslint-parser')
    return yml.configs['flat/recommended']
  } catch {
    return []
  }
}

/**
 * Default configuration for [eslint-plugin-yml](https://ota-meshi.github.io/eslint-plugin-yml/)
 */
export default await yamlConfig()
