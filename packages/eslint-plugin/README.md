# @the-stranger/eslint-plugin

ESLint plugin, which mostly consists of common configurations. It also includes a couple of ESLint configuration utilities.

## Configurations Provided

The configurations provided by this plugin include:

- **JSDoc**: Recommended configs from [eslint-plugin-jsdoc] for both TypeScript and JavaScript files, and allows the `@document` tag used by Docusaurus.
- **Node (n)**: Extends recommended config from [eslint-plugin-n].
- **Perfectionist**: Extends [eslint-plugin-perfectionist]; sorts ALL THE THINGS!
- **Promise**: Recommended rules from [eslint-plugin-promise].
- **Regexp**: Recommended rules from [eslint-plugin-regexp].
- **TypeScript ESLint**: Sets up linting for TypeScript using either [@nx/eslint-plugin] or [typescript-eslint], disabling some of the noisier ones
- **Unicorn**: Recommended rules from [eslint-plugin-unicorn] with a bunch of customizations.
- **YAML**: Recommended config from [eslint-plugin-yml], and adds key and array sorting. Uses [yaml-eslint-parser].

<!-- Links -->

[@nx/eslint-plugin]: https://nx.dev/docs/technologies/eslint/eslint-plugin/introduction
[eslint-plugin-jsdoc]: https://github.com/gajus/eslint-plugin-jsdoc
[eslint-plugin-n]: https://github.com/eslint-community/eslint-plugin-n
[eslint-plugin-perfectionist]: https://perfectionist.dev
[eslint-plugin-promise]: https://github.com/eslint-community/eslint-plugin-promise
[eslint-plugin-regexp]: https://ota-meshi.github.io/eslint-plugin-regexp
[eslint-plugin-unicorn]: https://github.com/sindresorhus/eslint-plugin-unicorn
[eslint-plugin-yml]: https://ota-meshi.github.io/eslint-plugin-yml
[typescript-eslint]: https://typescript-eslint.io
[yaml-eslint-parser]: https://github.com/ota-meshi/yaml-eslint-parser
