/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  rootDir: './tests',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    "**/?(*.)+(test).ts"
  ],
  silent: false,
};