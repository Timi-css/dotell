const js = require('@eslint/js');

module.exports = [
        js.configs.recommended,
        {
                languageOptions: {
                        ecmaVersion: 'latest',
                        globals: {
                                require: 'readonly',
                                module: 'readonly',
                                exports: 'readonly',
                                process: 'readonly',
                                console: 'readonly',
                                __dirname: 'readonly',
                        }
                },
                rules: {
                        'no-unused-vars': ['error', {
                                vars: 'all',
                                args: 'all',
                                ignoreRestSiblings: false,
                                argsIgnorePattern: '^_',
                                varsIgnorePattern: '^_',
                        }]
                }
        },
        {
                files: ['src/__tests__/**/*.js'],
                languageOptions: {
                        globals: {
                                describe: 'readonly',
                                it: 'readonly',
                                expect: 'readonly',
                                beforeEach: 'readonly',
                                afterEach: 'readonly',
                                beforeAll: 'readonly',
                                afterAll: 'readonly',
                        }
                }
        }
];