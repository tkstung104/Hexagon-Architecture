/** @type {import("jest").Config} */
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: false,
        tsconfig: { module: "commonjs", moduleResolution: "node" },
      },
    ],
  },
  moduleNameMapper: { "^(\\.{1,2}/.*)\\.js$": "$1" },
};
