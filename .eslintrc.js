module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  rules: {
    'max-len': ['warn', { code: 255 }],
    'no-unused-vars': 'warn', // Set this to "warn" instead of "error"
    "react/prop-types": "off",  // TypeScript replaces PropTypes

  },
  plugins: ['react', 'react-hooks']
}
