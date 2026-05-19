import { defineConfig } from "drizzle-kit";

if (!process.env.NEON_DATABASE_URL) {
  // During build / generation, process.env might not be defined. Provide a fallback or let Drizzle handle it.
  console.warn("Warning: NEON_DATABASE_URL is not set in environment variables");
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.NEON_DATABASE_URL || "",
  },
});
