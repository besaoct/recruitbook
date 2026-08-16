import { db } from "./index";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Running migration for experience_levels and education_levels tables...");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "experience_levels" (
      "id" varchar(64) PRIMARY KEY,
      "org_id" varchar(64) NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
      "name" text NOT NULL,
      "slug" varchar(64) NOT NULL,
      "min_years" integer DEFAULT 0,
      "max_years" integer DEFAULT 0,
      "description" text,
      "is_default" boolean DEFAULT false NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "education_levels" (
      "id" varchar(64) PRIMARY KEY,
      "org_id" varchar(64) NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
      "name" text NOT NULL,
      "slug" varchar(64) NOT NULL,
      "description" text,
      "is_default" boolean DEFAULT false NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    )
  `);

  console.log("✓ Experience & Education master tables successfully created!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
