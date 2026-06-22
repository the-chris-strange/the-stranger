import type { ConfigWithExtends } from '@the-stranger/eslint-utils'

export type Rules = Exclude<ConfigWithExtends['rules'], undefined>
