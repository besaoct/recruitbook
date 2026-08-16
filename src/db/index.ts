import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import * as schema from "./schema";

dotenv.config({ path: ".env" });

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/reqruitbook";

// Use Neon HTTP client for sub-second, connection-pool-free serverless queries
const sql = neon(connectionString);
export const db = drizzle(sql, { schema });

export * from "./schema";
