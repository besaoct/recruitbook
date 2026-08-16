import { db } from "./index";
import {
  organizations,
  departments,
  locations,
  roles,
  users,
  jobOpenings,
  candidates,
  jobApplications,
  interviews,
  offers,
  communicationTemplates,
} from "./schema";
import { hashPassword } from "../lib/auth/password";

export async function seed() {
  console.log("🌱 Starting ReqruitBook Database Seeding...");

  // 1. Organization
  const orgId = "org_my_organisation";
  await db
    .insert(organizations)
    .values({
      id: orgId,
      name: "My Organisation",
      slug: "my-organisation",
      careersDomain: "careers.myorganisation.com",
      logoUrl: "/logo.png",
      defaultCurrency: "USD",
      timezone: "UTC",
    })
    .onConflictDoUpdate({
      target: organizations.id,
      set: {
        name: "My Organisation",
        careersDomain: "careers.myorganisation.com",
        logoUrl: "/logo.png",
      },
    });

  console.log("✓ Organization created");

  // 2. Departments
  const deptEng = "dept_eng";
  const deptProd = "dept_prod";
  const deptSales = "dept_sales";
  const deptOps = "dept_ops";

  await db
    .insert(departments)
    .values([
      { id: deptEng, orgId, name: "Engineering", code: "ENG", leadName: "David Kim" },
      { id: deptProd, orgId, name: "Product & Design", code: "PRD", leadName: "Sarah Lopez" },
      { id: deptSales, orgId, name: "Sales & Growth", code: "SLS", leadName: "James Walker" },
      { id: deptOps, orgId, name: "Operations & HR", code: "OPS", leadName: "Recruiter" },
    ])
    .onConflictDoNothing();

  console.log("✓ Departments created");

  // 3. Locations
  const locSF = "loc_sf";
  const locNY = "loc_ny";
  const locLon = "loc_lon";

  await db
    .insert(locations)
    .values([
      { id: locSF, orgId, name: "San Francisco HQ", city: "San Francisco", country: "United States" },
      { id: locNY, orgId, name: "New York Hub", city: "New York", country: "United States" },
      { id: locLon, orgId, name: "London EMEA Office", city: "London", country: "United Kingdom" },
    ])
    .onConflictDoNothing();

  // 3b. Dynamic Roles & RBAC
  const defaultRoles = [
    {
      id: "role_system_admin",
      orgId,
      name: "System Administrator",
      slug: "system_admin",
      description: "Universal control over organization settings, RBAC role assignments, integrations, and all recruitment modules.",
      badge: "Super Admin",
      permissions: [
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
      ],
      isSystem: true,
    },
    {
      id: "role_hr_admin",
      orgId,
      name: "HR Administrator",
      slug: "hr_admin",
      description: "Full control over departments, user accounts, candidate offers, HRM employee sync, and compliance reports.",
      badge: "HR Admin",
      permissions: [
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
      ],
      isSystem: true,
    },
    {
      id: "role_recruiter",
      orgId,
      name: "Recruiter",
      slug: "recruiter",
      description: "Full requisition management, ATS candidate pipeline progression, interview coordination, and offer generation.",
      badge: "Recruiter",
      permissions: [
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
      ],
      isSystem: true,
    },
    {
      id: "role_hiring_manager",
      orgId,
      name: "Hiring Manager",
      slug: "hiring_manager",
      description: "Department candidate reviews, panel scorecard evaluations, and offer approvals for open team positions.",
      badge: "Hiring Lead",
      permissions: [
        "canAdvancePipeline",
        "canSubmitScorecard",
        "canViewScorecards",
        "canApproveOffers",
        "canViewSalaries",
        "canViewReports",
      ],
      isSystem: true,
    },
    {
      id: "role_interviewer",
      orgId,
      name: "Interviewer",
      slug: "interviewer",
      description: "Assigned panel interview participation, candidate resume access, and structured scorecard submission.",
      badge: "Interviewer",
      permissions: [
        "canSubmitScorecard",
        "canViewScorecards",
      ],
      isSystem: true,
    },
  ];

  for (const r of defaultRoles) {
    await db
      .insert(roles)
      .values(r)
      .onConflictDoNothing();
  }
  console.log("✓ Dynamic Roles created");

  // 4. Users with scrypt-hashed passwords
  const defaultPasswordHash = await hashPassword("ReqruitBook2026!");

  const userRecruiter = "usr_recruiter_01";
  const userAdmin = "usr_admin_01";
  const userHM = "usr_hm_01";
  const userInterviewer = "usr_intv_01";

  const userList: (typeof users.$inferInsert)[] = [
    {
      id: userRecruiter,
      orgId,
      name: "Recruiter",
      email: "recruiter@myorganisation.com",
      passwordHash: defaultPasswordHash,
      role: "recruiter",
      departmentId: deptOps,
    },
    {
      id: userAdmin,
      orgId,
      name: "System Administrator",
      email: "admin@myorganisation.com",
      passwordHash: defaultPasswordHash,
      role: "system_admin",
      departmentId: deptOps,
    },
    {
      id: userHM,
      orgId,
      name: "David Kim",
      email: "david.kim@myorganisation.com",
      passwordHash: defaultPasswordHash,
      role: "hiring_manager",
      departmentId: deptEng,
    },
    {
      id: userInterviewer,
      orgId,
      name: "Sarah Lopez",
      email: "sarah.lopez@myorganisation.com",
      passwordHash: defaultPasswordHash,
      role: "interviewer",
      departmentId: deptProd,
    },
  ];

  for (const u of userList) {
    await db
      .insert(users)
      .values(u)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          name: u.name,
          email: u.email,
          passwordHash: u.passwordHash,
          role: u.role,
          departmentId: u.departmentId,
        },
      });
  }

  console.log("✓ Users & RBAC created with secure scrypt password hashes");

  // 5. Job Openings
  const job1 = "JOB-101";
  const job2 = "JOB-102";
  const job3 = "JOB-103";

  const jobsList: (typeof jobOpenings.$inferInsert)[] = [
    {
      id: job1,
      orgId,
      title: "Staff Backend Engineer",
      departmentId: deptEng,
      locationId: locSF,
      hiringManagerId: userHM,
      recruiterId: userRecruiter,
      employmentType: "full_time",
      workMode: "hybrid",
      vacancies: 2,
      salaryMin: 180000,
      salaryMax: 220000,
      currency: "USD",
      status: "published",
      summary: "We are seeking a Staff Backend Engineer to lead our high-throughput distributed systems.",
      requirements: "8+ years in Go, PostgreSQL, Kafka, and Kubernetes architecture.",
    },
    {
      id: job2,
      orgId,
      title: "Lead Product Designer",
      departmentId: deptProd,
      locationId: locNY,
      hiringManagerId: userInterviewer,
      recruiterId: userRecruiter,
      employmentType: "full_time",
      workMode: "on_site",
      vacancies: 1,
      salaryMin: 160000,
      salaryMax: 190000,
      currency: "USD",
      status: "published",
      summary: "Lead our product design system and enterprise workflow design across Web & Mobile.",
      requirements: "7+ years design system, user research, and Figma expertise.",
    },
    {
      id: job3,
      orgId,
      title: "Senior Frontend Engineer (React/Next.js)",
      departmentId: deptEng,
      locationId: locSF,
      hiringManagerId: userHM,
      recruiterId: userRecruiter,
      employmentType: "full_time",
      workMode: "remote",
      vacancies: 3,
      salaryMin: 150000,
      salaryMax: 185000,
      currency: "USD",
      status: "published",
      summary: "Build cutting-edge React & Next.js microfrontends and high-performance UI systems.",
      requirements: "5+ years React, TypeScript, Next.js, and Tailwind CSS.",
    },
  ];

  await db.insert(jobOpenings).values(jobsList).onConflictDoNothing();

  console.log("✓ Job Requisitions created");

  // 6. Candidates
  const can1 = "CAN-501";
  const can2 = "CAN-502";
  const can3 = "CAN-503";

  const candidatesList: (typeof candidates.$inferInsert)[] = [
    {
      id: can1,
      orgId,
      fullName: "Sophia Chen",
      email: "sophia.chen@example.com",
      phone: "+1 555-0142",
      city: "San Francisco",
      country: "United States",
      currentCompany: "CloudScale Inc.",
      currentDesignation: "Senior Backend Engineer",
      totalExperienceYears: 8,
      expectedSalary: 195000,
      skills: ["Go", "Distributed Systems", "Kubernetes", "PostgreSQL"],
    },
    {
      id: can2,
      orgId,
      fullName: "Marcus Vance",
      email: "marcus.vance@designlabs.io",
      phone: "+1 555-0188",
      city: "New York",
      country: "United States",
      currentCompany: "FinCorp",
      currentDesignation: "Senior Product Designer",
      totalExperienceYears: 7,
      expectedSalary: 175000,
      skills: ["Figma", "Design Systems", "User Research", "Prototyping"],
    },
    {
      id: can3,
      orgId,
      fullName: "Aaliyah Patel",
      email: "aaliyah.patel@devbox.org",
      phone: "+1 555-0199",
      city: "Austin",
      country: "United States",
      currentCompany: "StartupX",
      currentDesignation: "Frontend Engineer",
      totalExperienceYears: 5,
      expectedSalary: 165000,
      skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    },
  ];

  await db.insert(candidates).values(candidatesList).onConflictDoNothing();

  console.log("✓ Candidates directory created");

  // 7. Applications
  const app1 = "APP-101";
  const app2 = "APP-102";
  const app3 = "APP-103";

  await db
    .insert(jobApplications)
    .values([
      {
        id: app1,
        jobId: job1,
        candidateId: can1,
        stage: "interview",
        fitScore: 96,
        source: "direct",
      },
      {
        id: app2,
        jobId: job2,
        candidateId: can2,
        stage: "offer",
        fitScore: 98,
        source: "linkedin",
      },
      {
        id: app3,
        jobId: job3,
        candidateId: can3,
        stage: "evaluation",
        fitScore: 92,
        source: "referral",
      },
    ])
    .onConflictDoNothing();

  console.log("✓ Job Applications created");

  // 8. Interviews
  await db
    .insert(interviews)
    .values([
      {
        id: "INT-201",
        applicationId: app1,
        candidateId: can1,
        roundTitle: "Technical Architecture & System Design",
        roundType: "technical",
        scheduledStart: new Date(Date.now() + 86400000), // Tomorrow
        durationMinutes: 60,
        meetingLink: "https://meet.google.com/abc-defg-hij",
        panelMemberIds: [userHM],
        status: "scheduled",
      },
    ])
    .onConflictDoNothing();

  console.log("✓ Interviews scheduled");

  // 9. Offers
  await db
    .insert(offers)
    .values([
      {
        id: "OFF-301",
        applicationId: app2,
        candidateId: can2,
        designation: "Lead Product Designer",
        departmentName: "Product & Design",
        baseSalary: 175000,
        currency: "USD",
        joiningDate: "2026-09-15",
        status: "sent",
        benefitsSummary: "Standard equity grant of 20,000 RSUs over 4 years with 1-year cliff.",
      },
    ])
    .onConflictDoNothing();

  console.log("✓ Offer letters generated");

  // 10. Communication Templates
  await db
    .insert(communicationTemplates)
    .values([
      {
        id: "TPL-01",
        orgId,
        name: "Application Received Confirmation",
        triggerEvent: "application_received",
        subject: "We received your application for {{job_title}} at {{company_name}}",
        bodyTemplate: "Hi {{candidate_name}},\n\nThank you for applying for the {{job_title}} role at {{company_name}}.\nOur talent team is reviewing your profile.\n\nBest regards,\nRecruiting Team",
      },
      {
        id: "TPL-02",
        orgId,
        name: "Interview Invitation",
        triggerEvent: "interview_invite",
        subject: "Interview Invitation: {{job_title}} at {{company_name}}",
        bodyTemplate: "Hi {{candidate_name}},\n\nWe would love to invite you for a {{round_name}} interview.\nPlease access the meeting link: {{meeting_link}}.\n\nBest,\n{{interviewer_name}}",
      },
    ])
    .onConflictDoNothing();

  console.log("✓ Communication templates initialized");
  console.log("✨ ReqruitBook database successfully seeded with live data!");
}

// Allow direct execution: tsx src/db/seed.ts
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seeding error:", err);
      process.exit(1);
    });
}
