module.exports = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    transform: {
        '^.+\\.(t|j)sx?$': '@swc/jest',
    },
}
