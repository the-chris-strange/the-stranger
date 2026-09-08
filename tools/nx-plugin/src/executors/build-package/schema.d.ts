export interface BuildPackageExecutorSchema {
  main: string
  outputPath: string
  tsConfig: string
  assets?: Array<string | AssetPattern>
  clean?: boolean
  generatePackageJson?: boolean
  rootDir?: string
  transformers?: Array<string | TransformerPattern>
  watch?: boolean
}

interface AssetPattern {
  glob: string
  input: string
  output: string
  ignore?: string[]
  includeIgnoredFiles?: boolean
}

interface TransformerPattern {
  name: string
  options?: Record<string, unknown>
}
