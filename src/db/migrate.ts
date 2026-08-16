import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function runMigrate() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in .env");
  }

  console.log("Connecting to PostgreSQL database...");
  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
  });

  const db = drizzle(pool);

  console.log("Running Drizzle migrations from ./drizzle...");
  await migrate(db, { migrationsFolder: "./drizzle" });

  console.log("✓ Migrations applied successfully!");
  await pool.end();
}

runMigrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
