/** @type {import('prettier').Config} */
export default {
  arrowParens: 'avoid',
  bracketSpacing: true,
  endOfLine: 'lf',
  tabWidth: 2,
  bracketSameLine: true,
  jsxSingleQuote: false,
  printWidth: 88,
  proseWrap: 'preserve',
  quoteProps: 'consistent',
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  useTabs: false,

  overrides: [
    {
      files: ['*.yml', '*.yaml'],
      options: {
        parser: 'yaml',
        singleQuote: false,
        printWidth: 120,
      },
    },
    {
      files: ['*.json', '*.jsonc'],
      options: {
        singleQuote: false,
        printWidth: 120,
        trailingComma: 'none',
      },
    },
    {
      files: ['package.json'],
      options: {
        plugins: ['prettier-plugin-packagejson'],
      },
    },
    {
      files: ['tsconfig.json', 'tsconfig.*.json'],
      options: {
        objectWrap: 'collapse',
      },
    },
    {
      files: ['*.md'],
      options: {
        proseWrap: 'preserve',
        printWidth: 120,
      },
    },
  ],
}
