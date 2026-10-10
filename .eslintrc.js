export default {
  root: true,
  extends: ['@react-native', 'prettier'],
  rules: {
    'prettier/prettier': 'warn',
    'object-curly-spacing': ['error', 'always'],
    'no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'after-used',
        caughtErrors: 'all',
        ignoreRestSiblings: false,
        reportUsedIgnorePattern: false,
      },
    ],
  },
};
