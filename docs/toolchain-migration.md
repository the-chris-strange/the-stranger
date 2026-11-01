# Toolchain migration

Development tools are pinned in root package.json and installed by mise:
Node 26.13.0 and pnpm 12.16.1. Published packages support Node 24 and 26.
Nx and first-party Nx plugins are aligned at 24.0.3.

The Node/pnpm checkpoint precedes the Nx migration commit. Nx 22 could not read
pnpm 12's two-document lockfile, so full verification required completing the Nx
upgrade. `pnpm exec nx migrate latest` generated the migration, followed by
`pnpm exec nx migrate --run-migrations` under Node 26. The generated TypeScript 6,
Vitest 5 and Verdaccio upgrades were deferred because they are optional.

The deterministic migrations completed. The deferred ESLint prompts required no
legacy-config or ban-types conversion. The removed Vitest watch executor was
replaced by an inferred watch target. Explicit typecheck targets retain checks
of test configurations that build-only inference would omit. Public library
options no longer refer to version-specific Nx internal declarations.

Pnpm packs built artifacts using publishConfig.directory. linkDirectory is false
so workspace dependencies remain linked to source packages with their own
node_modules; Vitest resolves source entrypoints through the existing TypeScript
path mappings. Tests build sibling packages first. Portable exported return types
avoid inferred declarations tied to pnpm's internal dependency paths.

The workspace constraints checker replaces Yarn's local enforcement, while public
Yarn helpers remain available. CI installs tools through mise and validates both
Node majors without Nx task-cache reuse. Environment-only proxy/backend settings
were needed to bootstrap tools in the managed execution environment; they are
not repository configuration.

See [optional dependency upgrades](dependency-upgrades.md) for candidates requiring
approval. No packages were published and no branch was pushed.

Review identified cross-major task-cache reuse and a declaration import unavailable
on older supported Nx versions; both were corrected. The independent review was
interrupted by a reviewer usage limit, so the remaining diff received self-review.

## Verification

- Uncached build, test, typecheck, lint, and constraint tests passed on Node
  26.13.0 and Node 24.19.0. Run the majors sequentially in a shared worktree:
  concurrent builds can overwrite the same declaration output.
- Frozen pnpm installation, manifest constraints, and full-tree formatting passed.
- Six package tarballs had valid exports, preserved Node engines, and no workspace
  protocols. All six imported in a clean consumer with the Nx ESLint peer installed.
- Nx release publish completed successfully in dry-run mode for all six packages.

## Approved toolchain upgrades

Nx 21 and 22 support has been removed; peer ranges now start at Nx 23.
ESLint and its configured plugins/parsers were upgraded to their latest stable
versions, alongside Commitlint 21, Vite 8 and Vitest 5. The obsolete direct
react-hooks-extra dependency was removed because the current React plugin no
longer uses it and it requires an older TypeScript API.

TypeScript 7.0.2 is installed as `@typescript/native`; `typescript` 6.0.3 supplies
the compiler API required by Nx and typescript-eslint. Builds invoke the native
compiler and copy package assets; typechecks also invoke version 7 directly.
This replaces the Nx TSC executor, which invokes the incompatible legacy API.
The root baseUrl and obsolete skipDefaultLibCheck options were removed for TS7.

The latest React plugin removed the shorthand JSX, naming-convention and
readonly-props rules configured here; obsolete references were removed. New
Unicorn coercion, string-ordering and ternary style defaults are explicitly
disabled to retain the existing policy and avoid changes to parsing behavior.
Other supported rules and their severity settings remain enabled.

The latest Astro parser/plugin requires Node 24.16 or Node 26.3, so engine
ranges retain both supported majors while raising their minimum patch releases.

The approved upgrade follow-up passed uncached build, tests, native TypeScript 7
checks, lint and constraint tests on Node 26.13.0 and 24.19.0. All six tarballs
contain their exported JavaScript/declarations and resolve workspace dependencies;
all six import successfully in a fresh consumer. Frozen installation, peer checks,
formatting, Commitlint 21 and Nx publish dry-run checks passed. The Nx plugin's
zero-warning lint configuration also passed after using ESLint 10's hyphenated
CLI option. These follow-up changes received local self-review.
