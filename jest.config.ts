import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.spec.ts"],
  clearMocks: true,
  testTimeout: 15_000,
};

export default config;
