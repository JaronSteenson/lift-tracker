module.exports = {
    extends: [
        'plugin:vue/essential',
        'plugin:prettier/recommended',
        'eslint:recommended',
    ],
    env: {
        es6: true,
        node: true,
        browser: true,
        jest: true,
    },
    plugins: ['jest'],
    overrides: [
        {
            files: ['*.spec.*'],
            rules: {
                'no-prototype-builtins': 'off',
            },
        },
    ],
    rules: {
        'prettier/prettier': [
            'error',
            {
                singleQuote: true,
            },
        ],
    },
};
