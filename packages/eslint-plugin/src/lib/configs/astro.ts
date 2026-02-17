import astroPlugin from 'eslint-plugin-astro'

import type { InfiniteConfigArray } from '../extend-config.js'

export const astro = [
  astroPlugin.configs['flat/recommended'],
  astroPlugin.configs['flat/jsx-a11y-strict'],
] satisfies InfiniteConfigArray

export default astro
