/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const path = require('path')

const fromRoot = d => path.join(__dirname, d)

module.exports = {
  roots: [fromRoot('tests')],
  resetMocks: true,
  testEnvironment: 'jsdom',
  transform: {
    "^.+\\.(t|j)sx?$": "ts-jest"
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx'],
  moduleNameMapper: {
    '~/(.*)': fromRoot('app/$1'),
  },
}
