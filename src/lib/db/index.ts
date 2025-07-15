import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ?? process.env.NEXT_PUBLIC_DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Configure for Neon Postgres with proper SSL handling
const client = postgres(connectionString, {
  max: process.env.NODE_ENV === "development" ? 5 : 20,
  ssl: connectionString.includes("sslmode=require") ? "require" : false,
  connect_timeout: 60,
  idle_timeout: 60,
  max_lifetime: 60 * 30,
});

export const db = drizzle(client, {
  schema,
  logger: process.env.NODE_ENV === "development",
});

// Export the client for raw queries if needed
export { client };
