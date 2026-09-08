# TheStranger

A collection of opinionated plugins & reusable configurations that make my life easier.

## Releasing

Preview the versions selected from conventional commits without changing files or publishing:

```shell
yarn release --dry-run
```

When the preview is correct, run the release. The command versions the packages, gets a fresh npm one-time password from the `NPM` item in 1Password, and publishes the changed packages publicly:

```shell
yarn release
```
