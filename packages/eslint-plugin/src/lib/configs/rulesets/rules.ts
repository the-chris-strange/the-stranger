import type { ConfigWithExtends } from '../../extend-config.js'

export type Rules = Exclude<ConfigWithExtends['rules'], undefined>
