// Vite configuration for the X1? overlay suite.
// This entry keeps the TanStack Start server entry aligned with src/server.ts.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
});
