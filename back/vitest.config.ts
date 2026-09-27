import { defineConfig } from "vitest/config";

// Default include: **/*.{test,spec}.?(c|m)[jt]s?(x)  → ya cubre src/habit.test.ts
// Default environment: "node"  → Zod es puro, no necesita otra cosa
// shared exporta TS crudo (exports: { "./*": "./src/*.ts" }), no hay build
export default defineConfig({});
