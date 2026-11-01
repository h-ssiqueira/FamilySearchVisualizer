import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

const reactLibraries = ['react', 'react/*', 'react-dom', 'react-dom/*', 'react-router-dom'];
const otherLayers = [
  '@/ui',
  '@/ui/*',
  '@/tree',
  '@/tree/*',
  '@/state',
  '@/state/*',
  '@/auth',
  '@/auth/*',
  '@/api',
  '@/api/*',
  '@/config',
  '@/config/*',
  '@/i18n',
  '@/i18n/*',
];

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'playwright-report', 'test-results', 'node_modules'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message: 'Names and places are untrusted text: never use dangerouslySetInnerHTML.',
        },
      ],
    },
  },
  // Import boundaries from the module design (SDD 4-design/2-module-design.md).
  {
    files: ['src/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [...reactLibraries, ...otherLayers, 'zod'],
              message: 'The domain layer must not import from other layers or from libraries.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/api/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [...reactLibraries, '@/ui', '@/ui/*', '@/tree', '@/tree/*'],
              message: 'The api layer must not import React, UI or tree code.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'UI code must not call fetch; use the API client.' },
      ],
    },
  },
  {
    files: ['*.config.{js,ts}', 'e2e/**/*.ts'],
    languageOptions: { globals: { ...globals.node } },
  },
  prettier,
);
