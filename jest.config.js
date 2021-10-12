require('nock').disableNetConnect()

module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  testRunner: 'jest-circus/runner',
  verbose: true
}
