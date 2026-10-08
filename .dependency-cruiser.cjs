const DOT_FILES = '(^|/)[.][^/]+[.](?:js|cjs|mjs|ts|cts|mts|json)$'
const TEST_FILES = '[.](?:spec|test)[.](?:js|mjs|cjs|jsx|ts|mts|cts|tsx)$'
const DECLARATION_FILES = '[.]d[.]ts$'
const TSCONFIG_FILES = '(^|/)tsconfig[.]json$'

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      comment: 'This dependency is part of a circular relationship',
      from: {},
      name: 'no-circular',
      severity: 'warn',
      to: {
        circular: true,
      },
    },

    {
      comment: 'This appears to be an orphaned module',
      from: {
        orphan: true,
        pathNot: [DOT_FILES, DECLARATION_FILES, TSCONFIG_FILES],
      },
      name: 'no-orphans',
      severity: 'warn',
      to: {},
    },

    {
      comment: 'A module depends on a core node module that has been deprecated.',
      from: {},
      name: 'no-deprecated-node',
      severity: 'warn',
      to: {
        dependencyTypes: ['core'],
        path: [
          '^v8/tools/codemap$',
          '^v8/tools/consarray$',
          '^v8/tools/csvparser$',
          '^v8/tools/logreader$',
          '^v8/tools/profile_view$',
          '^v8/tools/profile$',
          '^v8/tools/SourceMap$',
          '^v8/tools/splaytree$',
          '^v8/tools/tickprocessor-driver$',
          '^v8/tools/tickprocessor$',
          '^node-inspect/lib/_inspect$',
          '^node-inspect/lib/internal/inspect_client$',
          '^node-inspect/lib/internal/inspect_repl$',
          '^async_hooks$',
          '^punycode$',
          '^domain$',
          '^constants$',
          '^sys$',
          '^_linklist$',
          '^_stream_wrap$',
        ],
      },
    },

    {
      comment: 'This module uses a deprecated version of an npm module',
      from: {},
      name: 'no-deprecated-modules',
      severity: 'warn',
      to: {
        dependencyTypes: ['deprecated'],
      },
    },

    {
      comment:
        "This module depends on an npm package that isn't declared in its package.json",
      from: {},
      name: 'no-undeclared',
      severity: 'error',
      to: {
        dependencyTypes: ['npm-no-pkg', 'npm-unknown'],
      },
    },

    {
      comment: 'A dependency of this module could not be resolved',
      from: {},
      name: 'not-to-unresolvable',
      severity: 'error',
      to: {
        couldNotResolve: true,
      },
    },

    {
      comment: 'A dependency is declared in multiple scopes (e.g. runtime + dev)',
      from: {},
      name: 'no-duplicate-dep-types',
      severity: 'warn',
      to: {
        dependencyTypesNot: ['type-only', 'npm-peer'],
        moreThanOneDependencyType: true,
      },
    },

    {
      comment: 'This module depends on a test file',
      from: {},
      name: 'no-test-dependencies',
      severity: 'error',
      to: {
        path: TEST_FILES,
      },
    },

    {
      comment: 'This module declares a dev dependency that is used at runtime',
      from: {
        path: '^(packages)/.+?/src',
        pathNot: TEST_FILES,
      },
      name: 'no-runtime-as-dev',
      severity: 'error',
      to: {
        dependencyTypes: ['npm-dev'],
        // Peer dependencies are installed as dev dependencies in this workspace so they can be built and tested, but remain consumer-provided at runtime
        dependencyTypesNot: ['type-only', 'npm-peer'],
        pathNot: ['node_modules/@types/'],
      },
    },

    {
      comment:
        'This module depends on an npm package that is declared as an optional dependency',
      from: {},
      name: 'no-optional',
      severity: 'info',
      to: {
        dependencyTypes: ['npm-optional'],
      },
    },

    {
      comment:
        'This module depends on an npm package that is declared as a peer dependency',
      from: {},
      name: 'no-peer',
      severity: 'warn',
      to: {
        dependencyTypes: ['npm-peer'],
        pathNot: [
          '^node_modules/eslint(?:/|$)', // host for the ESLint config, plugin, and utilities
          '^node_modules/prettier(?:/|$)', // host for the Prettier plugin
        ],
      },
    },
  ],
  options: {
    combinedDependencies: false,

    // requires the typescript compiler
    detectJSDocImports: true,

    // detect calls to process.getBuiltinModule/globalThis.process.getBuiltinModule
    detectProcessBuiltinModuleCalls: true,

    doNotFollow: {
      path: ['node_modules', '.nx', '.agents', 'out-tsc'],
    },

    enhancedResolveOptions: {
      /**
       * List of conditions to check for in the exports field. Only works when the 'exportsFields' array is non-empty.
       */
      conditionNames: ['import', 'require', 'node', 'default', 'types'],

      /** What to consider as an 'exports' field in package.json files */
      exportsFields: ['exports'],

      /**
       * The extensions, by default are the same as the ones dependency-cruiser can access (run `npx dependency-cruiser --info` to see which ones that are in _your_ environment). If that list is larger than you need you can pass the extensions you actually use (e.g. ['.js', '.jsx']). This can speed up module resolution, which is the most expensive step.
       */
      // extensions: [".js", ".jsx", ".ts", ".tsx", ".d.ts"],

      mainFields: ['main', 'types', 'typings', 'module'],
    },

    exclude: {
      path: ['\/?dist\/.+$'],
    },

    reporterOptions: {
      archi: {
        /** Pattern of modules to consolidate to. */
        collapsePattern:
          '^(?:packages|src|lib(s?)|app(s?)|bin|test(s?)|spec(s?))/[^/]+|node_modules/(?:@[^/]+/[^/]+|[^/]+)',

        /**
         * Options to tweak the appearance of your graph. If you don't specify a theme for 'archi' dependency-cruiser will use the one specified in the dot section above and otherwise use the default one.
         */
        // theme: { },
      },
      dot: {
        /**
         * Pattern of modules to consolidate to. The default pattern in this configuration collapses everything in node_modules to one folder deep so you see the external modules, but not their innards.
         */
        collapsePattern: 'node_modules/(?:@[^/]+/[^/]+|[^/]+)',

        /**
         * Options to tweak the appearance of your graph. If you don't specify a theme dependency-cruiser falls back to a built-in one.
         * @see https://github.com/sverweij/dependency-cruiser/blob/main/doc/options-reference.md#reporteroptions
         */
        // theme: {
        //   graph: {
        //     // splines: 'ortho' - straight lines; slow on big graphs
        //     // splines: 'true' - bezier curves; fast but not as nice as ortho
        //     splines: 'true'
        //   },
        // },
      },
      text: {
        highlightFocused: true,
      },
    },

    /** Don't perform checks that aren't required by this config. */
    skipAnalysisNotInRules: true,

    tsConfig: {
      fileName: 'tsconfig.json',
    },

    /**
     * Detect dependencies that exist before ts-to-js compilation in addition to the default behavior of checking dependencies that exist after compilation.
     * @default false
     */
    tsPreCompilationDeps: true,
  },
}
