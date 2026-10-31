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
