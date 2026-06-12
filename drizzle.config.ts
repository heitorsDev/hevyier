import { defineConfig } from "drizzle-kit";

// driver "expo" makes `drizzle-kit generate` emit migrations.js, which
// inlines the .sql files via babel-plugin-inline-import for on-device use.
export default defineConfig({
  dialect: "sqlite",
  driver: "expo",
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
});
