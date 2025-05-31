import { ConfigBuilder } from '../config'

export const yamlConfig: ConfigBuilder = async () => {
  try {
    const yml = await import('eslint-plugin-yml')
    await import('yaml-eslint-parser')
    return yml.configs['flat/standard']
  } catch {
    return
  }
}
