import type { Config } from 'prettier'

export default {
  arrowParens: 'avoid',
  bracketSameLine: true,
  bracketSpacing: true,
  endOfLine: 'lf',
  jsxSingleQuote: false,
  overrides: [
    {
      files: ['*.yml', '*.yaml'],
      options: {
        parser: 'yaml',
        printWidth: 120,
        singleQuote: false,
      },
    },
    {
      files: ['*.json', '*.jsonc'],
      options: {
        printWidth: 120,
        singleQuote: false,
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
        printWidth: 120,
        proseWrap: 'preserve',
      },
    },
  ],
  printWidth: 88,
  proseWrap: 'preserve',
  quoteProps: 'consistent',
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',

  useTabs: false,
} satisfies Config
