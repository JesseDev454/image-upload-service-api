import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/server.ts",
    "!src/config/swagger.ts",
    "!src/types/**/*.d.ts"
  ],
  coverageDirectory: "coverage",
  clearMocks: true
};

export default config;
