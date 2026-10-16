import { defineConfig } from "vitest/config";

// Separate from vite.config.ts: the React Router plugin builds the app and must not run for
// unit tests of plain helpers.
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    include: ["app/**/*.test.ts"],
    environment: "node",
  },
});
