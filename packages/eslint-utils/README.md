# ESLint Utils

Utilities for authoring ESLint configuration files.

## Installation

Requires Node.js 24+ and ESLint 9+.

```bash
npm install --save-dev @the-stranger/eslint-utils
```

## Rule Severity

The `setSeverity` utility function can be used to modify the severity level of configuration objects in place.

### Set the severity level of all rules in a configuration object

```javascript
// eslint.config.mjs
import { setSeverity } from '@the-stranger/eslint-utils'
import jsPlugin from '@eslint/js'
import { defineConfig } from 'eslint/config'

export default defineConfig(
  // sets severity of all rules enabled in the jsPlugin.configs['recommended']
  // config, plus the js/no-await-in-loop rule, to 'warn'
  setSeverity(
    {
      files: ['**/*.js'],
      extends: [jsPlugin.configs['recommended']],
      plugins: {
        js: jsPlugin,
      }
      rules: {
        'js/no-await-in-loop': 'error',
      },
    },
    'warn', // or 'error', 'off', 0, 1, 2
  ),
)
```

### Set the severity of specific rules in a configuration object

```javascript
// eslint.config.mjs
import { setSeverity } from '@the-stranger/eslint-utils'
import jsPlugin from '@eslint/js'
import { defineConfig } from 'eslint/config'

const rulesToChange = [
  'js/for-direction',
  'getter-return',
  '@typescript-eslint/no-require-imports',
]

export default defineConfig(
  // only modifies the severity of rules specified in `rulesToChange`, and only if a
  // rule with that name is present in the configuration
  setSeverity(
    {
      files: ['**/*.js'],
      extends: [jsPlugin.configs['recommended']],
      plugins: {
        js: jsPlugin,
      }
      rules: {
        'js/no-await-in-loop': 'error',
      },
    },
    'warn', // or 'error', 'off', 0, 1, 2
  ),
)
```

## File Patterns

The `getFilePatterns` utility creates arrays of strings to pass to the `files` property of a config object.

### Get a pre-defined pattern

```javascript
// eslint.config.mjs
import { getFilePatterns, FilePatterns } from '@the-stranger/eslint-utils'
import jsPlugin from '@eslint/js'
import { defineConfig } from 'eslint/config'

export default defineConfig({
  files: getFilePatterns(FilePatterns.js),
  extends: [jsPlugin.configs['recommended']],
})
```

### Get multiple pre-defined patterns

```javascript
// eslint.config.mjs
import { getFilePatterns, FilePatterns } from '@the-stranger/eslint-utils'
import jsPlugin from '@eslint/js'
import { defineConfig } from 'eslint/config'

export default defineConfig({
  files: getFilePatterns(FilePatterns.js, FilePatterns.ts),
  extends: [jsPlugin.configs['recommended']],
})
```

### Get a combination of custom and pre-defined patterns

```javascript
// eslint.config.mjs
import { getFilePatterns, FilePatterns } from '@the-stranger/eslint-utils'
import jsPlugin from '@eslint/js'
import { defineConfig } from 'eslint/config'

export default defineConfig({
  files: getFilePatterns('**/*.cs', FilePatterns.js), // why are we matching C# files? ¯\_(ツ)_/¯
  extends: [jsPlugin.configs['recommended']],
})
```
