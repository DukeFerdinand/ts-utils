module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  "automock": false,
  setupFiles: [
    "./setupJest.ts"
  ],
  "collectCoverage": true,
  "coverageReporters": ["lcov"],
  "collectCoverageFrom": ["lib/**/*.{js,jsx,ts,tsx}"],
};