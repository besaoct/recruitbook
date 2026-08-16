import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/reqruitbook";

const sql = neon(connectionString);

async function migrateRoles() {
  console.log("🛠️  Running dynamic roles migration on Neon PostgreSQL...");

  try {
    // 1. Create roles table
    await sql`
      CREATE TABLE IF NOT EXISTS roles (
        id varchar(64) PRIMARY KEY,
        org_id varchar(64) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        name text NOT NULL,
        slug varchar(64) NOT NULL,
        description text,
        badge varchar(32) DEFAULT 'Custom',
        permissions jsonb DEFAULT '[]'::jsonb NOT NULL,
        is_system boolean DEFAULT false NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );
    `;
    console.log("✓ Created 'roles' table");

    // 2. Create index
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS roles_org_slug_idx ON roles (org_id, slug);
    `;
    console.log("✓ Created unique index on roles (org_id, slug)");

    // 3. Alter users.role column to varchar(64)
    await sql`
      ALTER TABLE users ALTER COLUMN role TYPE varchar(64) USING role::varchar(64);
    `;
    console.log("✓ Altered users.role to varchar(64)");

    // 4. Seed initial default roles if empty
    const orgs = await sql`SELECT id FROM organizations LIMIT 1;`;
    const targetOrgId = orgs[0]?.id || "org_my_organisation";

    // Ensure organization exists if not already
    await sql`
      INSERT INTO organizations (id, name, slug)
      VALUES (${targetOrgId}, 'My Organisation', 'my-organisation')
      ON CONFLICT (id) DO NOTHING;
    `;

    const existingRoles = await sql`SELECT count(*) as count FROM roles;`;
    const count = Number(existingRoles[0]?.count || 0);

    if (count === 0) {
      console.log(`🌱 Seeding default roles into 'roles' table for org: ${targetOrgId}...`);

      const defaultRoles = [
        {
          id: "role_system_admin",
          org_id: targetOrgId,
          name: "System Administrator",
          slug: "system_admin",
          description: "Universal control over organization settings, RBAC role assignments, integrations, and all recruitment modules.",
          badge: "Super Admin",
          permissions: JSON.stringify([
            "canManageSettings",
            "canManageUsers",
            "canAssignRoles",
            "canManageDepartments",
            "canCreateJobs",
            "canEditJobs",
            "canDeleteJobs",
            "canManageCandidates",
            "canAdvancePipeline",
            "canScheduleInterviews",
            "canSubmitScorecard",
            "canViewScorecards",
            "canCreateOffers",
            "canApproveOffers",
            "canViewSalaries",
            "canSendCommunications",
            "canSyncHRM",
            "canViewReports",
          ]),
          is_system: true,
        },
        {
          id: "role_hr_admin",
          org_id: targetOrgId,
          name: "HR Administrator",
          slug: "hr_admin",
          description: "Full control over departments, user accounts, candidate offers, HRM employee sync, and compliance reports.",
          badge: "HR Admin",
          permissions: JSON.stringify([
            "canManageSettings",
            "canManageUsers",
            "canManageDepartments",
            "canCreateJobs",
            "canEditJobs",
            "canDeleteJobs",
            "canManageCandidates",
            "canAdvancePipeline",
            "canScheduleInterviews",
            "canSubmitScorecard",
            "canViewScorecards",
            "canCreateOffers",
            "canApproveOffers",
            "canViewSalaries",
            "canSendCommunications",
            "canSyncHRM",
            "canViewReports",
          ]),
          is_system: true,
        },
        {
          id: "role_recruiter",
          org_id: targetOrgId,
          name: "Recruiter",
          slug: "recruiter",
          description: "Full requisition management, ATS candidate pipeline progression, interview coordination, and offer generation.",
          badge: "Recruiter",
          permissions: JSON.stringify([
            "canCreateJobs",
            "canEditJobs",
            "canManageCandidates",
            "canAdvancePipeline",
            "canScheduleInterviews",
            "canSubmitScorecard",
            "canViewScorecards",
            "canCreateOffers",
            "canViewSalaries",
            "canSendCommunications",
            "canSyncHRM",
            "canViewReports",
          ]),
          is_system: true,
        },
        {
          id: "role_hiring_manager",
          org_id: targetOrgId,
          name: "Hiring Manager",
          slug: "hiring_manager",
          description: "Department candidate reviews, panel scorecard evaluations, and offer approvals for open team positions.",
          badge: "Hiring Lead",
          permissions: JSON.stringify([
            "canAdvancePipeline",
            "canSubmitScorecard",
            "canViewScorecards",
            "canApproveOffers",
            "canViewSalaries",
            "canViewReports",
          ]),
          is_system: true,
        },
        {
          id: "role_interviewer",
          org_id: targetOrgId,
          name: "Interviewer",
          slug: "interviewer",
          description: "Assigned panel interview participation, candidate resume access, and structured scorecard submission.",
          badge: "Interviewer",
          permissions: JSON.stringify([
            "canSubmitScorecard",
            "canViewScorecards",
          ]),
          is_system: true,
        },
      ];

      for (const r of defaultRoles) {
        await sql`
          INSERT INTO roles (id, org_id, name, slug, description, badge, permissions, is_system)
          VALUES (${r.id}, ${r.org_id}, ${r.name}, ${r.slug}, ${r.description}, ${r.badge}, ${r.permissions}::jsonb, ${r.is_system})
          ON CONFLICT (org_id, slug) DO NOTHING;
        `;
      }
      console.log("✓ Seeded 5 initial system roles into 'roles' table");
    } else {
      console.log(`✓ 'roles' table already populated with ${count} roles`);
    }

    console.log("🎉 Dynamic RBAC migration completed successfully!");
  } catch (err) {
    console.error("❌ Migration error:", err);
    process.exit(1);
  }
}

migrateRoles();
