const esModules = ['vuetify'].join('|');

module.exports = {
    testRegex: 'resources/js/test/.*.spec.js$',
    moduleFileExtensions: ['js', 'json', 'vue'],
    transform: {
        '.*\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$':
            '<rootDir>/resources/js/test/jest-transform-stub',
        '.*\\.(js)$': '<rootDir>/node_modules/babel-jest',
        '.*\\.(vue)$': '<rootDir>/node_modules/vue-jest',
    },
    transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
};
