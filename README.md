# TheStranger

A collection of opinionated plugins & reusable configurations that make my life easier.

## Development setup

Install [mise](https://mise.jdx.dev/getting-started.html) and activate it in your
shell (`eval "$(mise activate bash)"` for Bash), then run:

```sh
mise install
mise exec -- pnpm install --frozen-lockfile
pnpm ci
```

The root `mise.toml` enables idiomatic version files for Node and pnpm. Exact
versions live in root `package.json`: `devEngines.runtime` selects development
Node and `packageManager` selects pnpm. No global mise setting is required.
Published packages support Node 24 and 26; development uses Node 26. Keep Node
24 types to protect compatibility, and validate changes on both Node majors.

Use `pnpm nx` to run workspace tasks. `pnpm constraints` checks package metadata
and shared dependency versions; `pnpm constraints --fix` applies corrections.
The Nx command wrapper loads optional `.env`, `.env.ci`, `.env.dev`, and
`.env.production` files in that order; existing shell variables take precedence.

Internal dependencies use `workspace:*`. Nx builds packages into `dist`, and
pnpm packs/publishes those artifacts using each package's `publishConfig.directory`.
Pnpm converts workspace protocols to exact versions during packaging. Public
Yarn configuration helpers remain supported independently of workspace tooling.
