module.exports = {
    root: true,
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    parser: 'vue-eslint-parser',
    parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    rules: {
        '@typescript-eslint/strict-boolean-expressions': 'warn',
        '@typescript-eslint/explicit-function-return-types': 'warn',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
}
