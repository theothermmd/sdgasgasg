// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import tailwind from 'eslint-plugin-tailwindcss';

export default [
  { ignores: ['dist', 'node_modules', 'build'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
      import: importPlugin,
      tailwind,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // Base
      ...js.configs.recommended.rules,

      // React
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // Tailwind
      ...tailwind.configs['recommended'].rules,

      // Accessibility
      ...jsxA11y.configs.recommended.rules,

      // React Refresh
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Import sorting
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
        },
      ],

      // General rules
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react/react-in-jsx-scope': 'off', // Next.js یا Vite معمولاً نیاز نداره
      'react/prop-types': 'off', // اگر از TS استفاده نمی‌کنی، می‌تونی فعالش کنی
    },
  },
  {
    env: {
      browser: true,
      node: true,
      es2021: true,
    },
  },
];
