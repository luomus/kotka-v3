import tseslint from 'typescript-eslint';
import pluginCypress from 'eslint-plugin-cypress'

export default [
  { files: ['**/*.{ts,js}'] },
  ...tseslint.configs.recommended,
  pluginCypress.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2020
    },
  },
  {
    rules: {}
  }
]
