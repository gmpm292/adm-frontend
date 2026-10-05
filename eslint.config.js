import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist', 'public/qz-tray.js'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Sistema de diseño (ver src/theme/README.md): los estilos viven en src/theme
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'JSXAttribute[name.name=/^(style|headerStyle|bodyStyle|contentStyle|inputStyle|panelStyle)$/]',
          message:
            'No se permiten estilos en línea. Usa componentes de src/components/ui, clases de PrimeFlex o añade la clase en src/theme.',
        },
        {
          selector: 'ImportDeclaration[source.value=/\\.css$/]',
          message:
            'Los componentes no importan CSS. Los estilos viven en src/theme y se cargan desde src/main.jsx.',
        },
      ],
    },
  },
  {
    // Único punto de entrada de estilos
    files: ['src/main.jsx'],
    rules: { 'no-restricted-syntax': 'off' },
  },
]
