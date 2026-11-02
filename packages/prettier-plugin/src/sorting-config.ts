import type { Config } from 'prettier'

import config from './config.js'
import sortingPlugin from './sorting.js'

/**
 * Shared styling plus opt-in configuration-file and general data sorting.
 */
export default {
  ...config,
  orderedSortConfigFiles: true,
  plugins: [sortingPlugin],
} as const satisfies Config
