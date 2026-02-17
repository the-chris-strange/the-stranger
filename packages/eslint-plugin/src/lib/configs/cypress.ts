import cypressPlugin from 'eslint-plugin-cypress'

import type { InfiniteConfigArray } from '../extend-config.js'

export const cypress = [cypressPlugin.configs.recommended] satisfies InfiniteConfigArray

export default cypress
