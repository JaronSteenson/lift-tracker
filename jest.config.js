const esModules = ['vuetify'].join('|');

module.exports = {
    testEnvironment: 'jsdom',
    testRegex: 'resources/js/test/.*.spec.js$',
    moduleFileExtensions: ['ts', 'js', 'json', 'vue'],
    transform: {
        '.*\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$':
            '<rootDir>/resources/js/test/jest-transform-stub.js',
        '.*\\.(js)$': '<rootDir>/node_modules/babel-jest',
        '.*\\.(vue)$': '@vue/vue3-jest',
    },
    transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
    testEnvironmentOptions: {
        customExportConditions: ['node', 'node-addons'],
    },
};
