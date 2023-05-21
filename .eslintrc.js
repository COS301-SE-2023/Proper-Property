module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: [
    '@typescript-eslint',
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    // linting rules below:
    'no-console': 'warn', //warnings for console statements
    'no-unused-vars': 'error', //errors for unused variables
    'no-use-before-define': 'error', //errors for use of variables before definition
  },
};
