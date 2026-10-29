# @the-stranger/yarn-config

A small package to assist with yarn constraints configuration.

Use `defineConstraints` for each workspace in your Yarn constraint callback:

```typescript
import { defineConstraints } from '@the-stranger/yarn-config'

const constrain = defineConstraints({
  license: 'Apache-2.0',
  nodeEngines: '>=22',
  repository: { type: 'git', url: 'https://example.com/team/repository.git' },
  projectVersions: [
    { name: 'shared', version: '2.0.0' },
    { name: '@team/shared', version: '3.0.0' },
    { name: '@team/independent' },
  ],
})

export default {
  async constraints({ Yarn }) {
    for (const workspace of Yarn.workspaces()) {
      if (workspace.cwd !== '.') await constrain(workspace, Yarn)
    }
  },
}
```

License, Node engine, and repository options accept explicit values. Set an option to `true` to inherit the root manifest value; omit it or set it to `false` to leave that field unchanged. Enabled metadata constraints remove fields from private workspaces unless `options.includePrivate` is `true`. A missing root repository removes the inherited repository field.

Version constraints match exact scoped names or exact unscoped package names. Scoped matches take precedence, and the first entry wins within equal specificity. In this example, `@team/shared` receives `3.0.0`; another scope's `shared` receives `2.0.0`. A matching entry without a version leaves the version unchanged. Unmatched projects inherit the root version when `projectVersions` is supplied.

The `setLicense(workspace, yarnOrLicense, options?)` and `setNodeEngine(workspace, yarnOrRange, options?)` helpers accept either the Yarn context or an explicit string.
