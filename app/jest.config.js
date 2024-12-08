module.exports = {
    // The root directory that Jest should scan for tests and modules
    rootDir: '.',

    // The test environment that will be used for testing
    testEnvironment: 'jsdom',

    // The glob patterns Jest uses to detect test files
    testMatch: [
        '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
        '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}'
    ],

    // An array of regexp pattern strings that are matched against all test paths
    testPathIgnorePatterns: [
        '/node_modules/',
    ],

    // Transform files with babel-jest
    transform: {
        '^.+\\.(js|jsx)$': 'babel-jest'
    },

    // Module name mapper for handling static assets
    moduleNameMapper: {
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/__mocks__/fileMock.js',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
    },

    // Setup files to run before each test
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],

    // Module file extensions
    moduleFileExtensions: ['js', 'jsx', 'json', 'node'],

    // Collect coverage from the following files
    collectCoverageFrom: [
        'src/**/*.{js,jsx}',
        '!src/index.js',
        '!src/serviceWorker.js'
    ],

    // Coverage threshold
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    }
};
