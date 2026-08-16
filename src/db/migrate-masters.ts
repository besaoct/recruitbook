import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");

  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
  });

  console.log("Applying schema updates for work_modes and employment_types...");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "work_modes" (
      "id" varchar(64) PRIMARY KEY NOT NULL,
      "org_id" varchar(64) NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
      "name" text NOT NULL,
      "slug" varchar(64) NOT NULL,
      "description" text,
      "is_default" boolean DEFAULT false NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "employment_types" (
      "id" varchar(64) PRIMARY KEY NOT NULL,
      "org_id" varchar(64) NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
      "name" text NOT NULL,
      "slug" varchar(64) NOT NULL,
      "description" text,
      "is_default" boolean DEFAULT false NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );

    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='job_openings' AND column_name='work_mode'
      ) THEN
        ALTER TABLE "job_openings" ALTER COLUMN "work_mode" SET DATA TYPE varchar(64);
        ALTER TABLE "job_openings" ALTER COLUMN "work_mode" SET DEFAULT 'hybrid';
      END IF;

      IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='job_openings' AND column_name='employment_type'
      ) THEN
        ALTER TABLE "job_openings" ALTER COLUMN "employment_type" SET DATA TYPE varchar(64);
        ALTER TABLE "job_openings" ALTER COLUMN "employment_type" SET DEFAULT 'full_time';
      END IF;
    END $$;
  `);

  console.log("✓ Dynamic Masters schema migration complete!");
  await pool.end();
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
