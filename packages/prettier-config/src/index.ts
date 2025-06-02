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
      files: ['*.md'],
      options: {
        printWidth: 120,
        proseWrap: 'preserve',
      },
    },
  ],
  plugins: ['prettier-plugin-packagejson'],
  printWidth: 88,
  proseWrap: 'preserve',
  quoteProps: 'consistent',
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  useTabs: false,
} satisfies Config
