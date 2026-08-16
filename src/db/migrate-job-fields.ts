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

  console.log("Applying schema updates for expanded job requisition fields & benefitsList...");

  await pool.query(`
    ALTER TABLE "job_openings" ADD COLUMN IF NOT EXISTS "req_code" varchar(64);
    ALTER TABLE "job_openings" ADD COLUMN IF NOT EXISTS "experience_level" varchar(64) DEFAULT 'mid';
    ALTER TABLE "job_openings" ADD COLUMN IF NOT EXISTS "education_level" varchar(64) DEFAULT 'bachelors';
    ALTER TABLE "job_openings" ADD COLUMN IF NOT EXISTS "pay_frequency" varchar(32) DEFAULT 'annual';
    ALTER TABLE "job_openings" ADD COLUMN IF NOT EXISTS "is_salary_public" boolean DEFAULT true NOT NULL;
    ALTER TABLE "job_openings" ADD COLUMN IF NOT EXISTS "equity_range" text;
    ALTER TABLE "job_openings" ADD COLUMN IF NOT EXISTS "bonus_structure" text;
    ALTER TABLE "job_openings" ADD COLUMN IF NOT EXISTS "relocation_assistance" text;
    ALTER TABLE "job_openings" ADD COLUMN IF NOT EXISTS "target_start_date" timestamp;
    ALTER TABLE "job_openings" ADD COLUMN IF NOT EXISTS "nice_to_have" text;
    ALTER TABLE "job_openings" ADD COLUMN IF NOT EXISTS "about_team" text;
    ALTER TABLE "job_openings" ADD COLUMN IF NOT EXISTS "benefits_list" jsonb DEFAULT '[]'::jsonb;
    ALTER TABLE "job_openings" ADD COLUMN IF NOT EXISTS "secondary_skills" jsonb DEFAULT '[]'::jsonb;
  `);

  console.log("✓ Expanded job fields & benefits_list migration completed successfully!");
  await pool.end();
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
