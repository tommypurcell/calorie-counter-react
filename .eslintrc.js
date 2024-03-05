module.exports = {
  extends: ['plugin:react/recommended'],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    'max-len': ['error', { code: 255 }]
  }
}
