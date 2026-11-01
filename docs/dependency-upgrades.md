# Remaining optional dependency upgrades

The ESLint ecosystem, Commitlint 21, TypeScript 7 compiler, Vite 8, and Vitest 5 upgrades have been approved and applied. The candidates below remain pending approval.

The current column records the imported pre-Nx installation. A newer registry release is a candidate, not a compatibility recommendation. Keep Node types on major 24 to protect published compatibility. Upgrade ESLint plugins/parsers together where needed; keep Vitest, UI, and coverage versions aligned. Nx currently requires Verdaccio 6, so defer Verdaccio 7.

| Dependency                         | Current installed | Latest available |
| ---------------------------------- | ----------------- | ---------------- |
| `@cspell/dict-scientific-terms-us` | 3.1.0             | 3.1.2            |
| `@dotenvx/dotenvx`                 | 1.64.0            | 2.38.2           |
| `@swc-node/register`               | 1.11.1            | 1.12.1           |
| `@swc/cli`                         | 0.8.1             | 0.8.2            |
| `@swc/core`                        | 1.15.26           | 1.16.21          |
| `@swc/helpers`                     | 0.5.21            | 0.5.23           |
| `@types/node`                      | 24.12.2           | 26.6.6           |
| `@types/semver`                    | 7.7.1             | 7.8.0            |
| `chalk`                            | 5.6.2             | 6.0.1            |
| `cspell`                           | 10.0.0            | 10.4.0           |
| `get-tsconfig`                     | 4.14.0            | 4.14.3           |
| `jest`                             | 30.3.0            | 30.5.2           |
| `jiti`                             | 2.6.1             | 2.7.0            |
| `jsdom`                            | 26.1.0            | 30.1.3           |
| `prettier`                         | 3.8.3             | 3.9.10           |
| `prettier-plugin-packagejson`      | 3.0.2             | 3.0.3            |
| `semver`                           | 7.8.1             | 7.8.5            |
| `sort-package-json`                | 3.6.1             | 4.1.0            |
| `tslib`                            | 2.8.1             | 2.9.1            |
| `type-fest`                        | 5.8.0             | 5.10.0           |
| `verdaccio`                        | 6.5.2             | 7.0.2            |
