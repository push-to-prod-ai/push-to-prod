import { defineConfig } from "vitest/config.js";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    coverage: {
      provider: "v8",
    },
  },
});
