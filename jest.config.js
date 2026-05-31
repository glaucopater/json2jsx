/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  modulePathIgnorePatterns: [
    "<rootDir>/output/",
    "<rootDir>/scripts/playground/",
  ],
};
