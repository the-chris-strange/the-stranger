import { Tsconfig } from 'tsconfig-type'

import { GeneratorSchema } from '../../lib/generator-schema'
import { TSConfigOptions } from '../../lib/tsconfig'

/**
 * Options for generating tsconfig.json files.
 */
export interface TSConfigSchema extends TSCFields {
  /**
   * The name of the project in which to generate the tsconfig file.
   */
  project: string
  /**
   * The name to use for the generated tsconfig file.
   * @default 'tsconfig.json'
   */
  fileName?: string
  /**
   * Options to pass to the TSConfig constructor.
   */
  tscOptions?: TSConfigOptions
}

type TSCFields = GeneratorSchema &
  Pick<
    Tsconfig,
    'compilerOptions' | 'exclude' | 'extends' | 'files' | 'include' | 'references'
  >
