import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./src/tests/setup.ts"],
    testTimeout: 10000,
    exclude: [
      "node_modules/**",
      "dist/**"
    ]
  }
});