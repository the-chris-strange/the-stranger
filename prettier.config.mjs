import { join } from 'node:path'

import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url, {
  alias: {
    '@the-stranger/ordered': join(import.meta.dirname, 'packages/ordered/src/index.ts'),
    '@the-stranger/prettier-plugin': join(
      import.meta.dirname,
      'packages/prettier-plugin/src/index.ts',
    ),
  },
})

const { sortingConfig } = await jiti.import('@the-stranger/prettier-plugin')

export default sortingConfig
