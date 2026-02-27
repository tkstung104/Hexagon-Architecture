/** @type {import("jest").Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: false,
        tsconfig: { module: "commonjs", moduleResolution: "node" },
      },
    ],
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^@entities/(.*)\\.js$": "<rootDir>/src/entities/$1",
    "^@entities/(.*)$": "<rootDir>/src/entities/$1",
    "^@port/(.*)\\.js$": "<rootDir>/src/port/$1",
    "^@port/(.*)$": "<rootDir>/src/port/$1",
    "^@application/(.*)\\.js$": "<rootDir>/src/application/$1",
    "^@application/(.*)$": "<rootDir>/src/application/$1",
    "^@infrastructure/(.*)\\.js$": "<rootDir>/src/infrastructure/$1",
    "^@infrastructure/(.*)$": "<rootDir>/src/infrastructure/$1",
  },
};
