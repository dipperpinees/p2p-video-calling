module.exports = {
    parser: '@typescript-eslint/parser',

    parserOptions: {
        sourceType: 'module',
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
    },

    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
    ],

    env: {
        node: true,
        es2020: true,
    },
    rules: {
        '@typescript-eslint/no-misused-promises': 'off',
    },
};
