import { join } from 'node:path'

import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url, {
  alias: {
    '@the-stranger/prettier-plugin': join(
      import.meta.dirname,
      'packages/prettier-plugin/src/index.ts',
    ),
  },
})

/** @type {import('@the-stranger/prettier-plugin')} */
const config = await jiti.import('@the-stranger/prettier-plugin', { default: true })

export default config
