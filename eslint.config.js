import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    settings: { react: { version: '18.3' } },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-refresh': reactRefreshPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'react/jsx-no-target-blank': 'warn',
      'react/prop-types': 'off',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Enforce I18nLink usage — error on direct Link imports from react-router-dom
      'no-restricted-imports': ['error', {
        paths: [{
          name: 'react-router-dom',
          importNames: ['Link', 'NavLink'],
          message: 'Use I18nLink/I18nNavLink from "src/i18n/I18nLink" instead of Link/NavLink from react-router-dom for localization support.',
        }],
      }],
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    ignores: ['dist', 'build', 'node_modules', 'public', '*.config.js', '.agents/**', '.claude/**', '.kiro/**', '.kilo/**', '.opencode/**', '.wiki/**', 'scripts/**'],
  },
];
