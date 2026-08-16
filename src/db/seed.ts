import { db } from "./index";

import {
  organizations,
  departments,
  locations,
  workModes,
  employmentTypes,
  experienceLevels,
  educationLevels,
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
  const locLondon = "loc_london";
  const locRemote = "loc_remote";

  await db
    .insert(locations)
    .values([
      {
        id: locSF,
        orgId,
        name: "San Francisco HQ",
        city: "San Francisco",
        country: "United States",
        isRemoteHub: false,
      },
      {
        id: locLondon,
        orgId,
        name: "London EMEA Office",
        city: "London",
        country: "United Kingdom",
        isRemoteHub: false,
      },
      {
        id: locRemote,
        orgId,
        name: "Global Remote Hub",
        city: "Remote",
        country: "Worldwide",
        isRemoteHub: true,
      },
    ])
    .onConflictDoNothing();

  console.log("✓ Locations created");

  // 3a. Dynamic Work Modes
  await db
    .insert(workModes)
    .values([
      {
        id: "wm_hybrid",
        orgId,
        name: "Hybrid",
        slug: "hybrid",
        description: "Flexible split between office collaboration and home setup.",
        isDefault: true,
      },
      {
        id: "wm_remote",
        orgId,
        name: "Remote (Worldwide)",
        slug: "remote",
        description: "Fully remote with asynchronous communication.",
        isDefault: false,
      },
      {
        id: "wm_onsite",
        orgId,
        name: "On-Site / Office",
        slug: "on_site",
        description: "Dedicated on-premise office attendance.",
        isDefault: false,
      },
      {
        id: "wm_flexible",
        orgId,
        name: "Flexible / Travel",
        slug: "flexible",
        description: "Frequent travel or client site presence required.",
        isDefault: false,
      },
    ])
    .onConflictDoNothing();

  console.log("✓ Work Modes created");

  // 3b. Dynamic Employment Types
  await db
    .insert(employmentTypes)
    .values([
      {
        id: "et_fulltime",
        orgId,
        name: "Full-Time Permanent",
        slug: "full_time",
        description: "Standard salaried employee with comprehensive benefits.",
        isDefault: true,
      },
      {
        id: "et_parttime",
        orgId,
        name: "Part-Time",
        slug: "part_time",
        description: "Structured reduced hourly schedule.",
        isDefault: false,
      },
      {
        id: "et_contract",
        orgId,
        name: "Fixed-Term Contract",
        slug: "contract",
        description: "Defined duration or deliverable-based contract.",
        isDefault: false,
      },
      {
        id: "et_internship",
        orgId,
        name: "Internship",
        slug: "internship",
        description: "Apprentice or student career training program.",
        isDefault: false,
      },
      {
        id: "et_freelance",
        orgId,
        name: "Freelance / Consultant",
        slug: "freelance",
        description: "Specialized advisory or per-project engagement.",
        isDefault: false,
      },
    ])
    .onConflictDoNothing();

  console.log("✓ Employment Types created");

  // 3c. Dynamic Experience Levels
  await db
    .insert(experienceLevels)
    .values([
      {
        id: "exp_intern",
        orgId,
        name: "Intern / Trainee",
        slug: "intern",
        minYears: 0,
        maxYears: 0,
        description: "Student or early career trainee program.",
        isDefault: false,
      },
      {
        id: "exp_entry",
        orgId,
        name: "Entry Level (0-2 yrs)",
        slug: "entry",
        minYears: 0,
        maxYears: 2,
        description: "Junior / associate individual contributors.",
        isDefault: false,
      },
      {
        id: "exp_mid",
        orgId,
        name: "Mid Level (3-5 yrs)",
        slug: "mid",
        minYears: 3,
        maxYears: 5,
        description: "Autonomous professional practitioners.",
        isDefault: true,
      },
      {
        id: "exp_senior",
        orgId,
        name: "Senior Level (5-8 yrs)",
        slug: "senior",
        minYears: 5,
        maxYears: 8,
        description: "Subject matter expert with track record of independent execution.",
        isDefault: false,
      },
      {
        id: "exp_lead",
        orgId,
        name: "Staff / Principal (8+ yrs)",
        slug: "lead_staff",
        minYears: 8,
        maxYears: 12,
        description: "Technical lead or strategic organizational contributor.",
        isDefault: false,
      },
      {
        id: "exp_exec",
        orgId,
        name: "Director / Executive (10+ yrs)",
        slug: "director_executive",
        minYears: 10,
        maxYears: 30,
        description: "Executive or department head leadership.",
        isDefault: false,
      },
    ])
    .onConflictDoNothing();

  console.log("✓ Experience Levels created");

  // 3d. Dynamic Education Requirements
  await db
    .insert(educationLevels)
    .values([
      {
        id: "edu_none",
        orgId,
        name: "No Specific Degree Required",
        slug: "none",
        description: "Open to equivalent practical experience and self-taught skills.",
        isDefault: false,
      },
      {
        id: "edu_highschool",
        orgId,
        name: "High School / Diploma",
        slug: "high_school",
        description: "Secondary education or equivalent diploma.",
        isDefault: false,
      },
      {
        id: "edu_bachelors",
        orgId,
        name: "Bachelor's Degree or Equivalent",
        slug: "bachelors",
        description: "Undergraduate bachelor's degree in related domain.",
        isDefault: true,
      },
      {
        id: "edu_masters",
        orgId,
        name: "Master's Degree",
        slug: "masters",
        description: "Postgraduate master's degree or professional qualification.",
        isDefault: false,
      },
      {
        id: "edu_phd",
        orgId,
        name: "Doctorate / PhD",
        slug: "doctorate",
        description: "Doctoral research degree or advanced scientific doctorate.",
        isDefault: false,
      },
    ])
    .onConflictDoNothing();

  console.log("✓ Education Requirements created");

  // 3e. Dynamic Roles & RBAC
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
        "canManageLocations",
        "canManageWorkModes",
        "canManageEmploymentTypes",
        "canManageExperienceLevels",
        "canManageEducationLevels",
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
        "canManageLocations",
        "canManageWorkModes",
        "canManageEmploymentTypes",
        "canManageExperienceLevels",
        "canManageEducationLevels",
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
        "canManageDepartments",
        "canManageLocations",
        "canManageWorkModes",
        "canManageEmploymentTypes",
        "canManageExperienceLevels",
        "canManageEducationLevels",
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
      .onConflictDoUpdate({
        target: roles.id,
        set: {
          name: r.name,
          description: r.description,
          badge: r.badge,
          permissions: r.permissions,
        },
      });
  }
  console.log("✓ Dynamic Roles created & updated");

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

  const sampleBenefitsList = [
    {
      id: "b1",
      title: "Comprehensive Health, Dental & Vision",
      description: "100% premium coverage for employees and 75% for dependents with top-tier PPO/HMO options.",
      category: "healthcare",
    },
    {
      id: "b2",
      title: "401(k) / Pension 5% Match",
      description: "Dollar-for-dollar matching up to 5% with immediate vesting from day one.",
      category: "financial",
    },
    {
      id: "b3",
      title: "Equity & Incentive Stock Options",
      description: "Meaningful early-stage equity grants with standard 4-year vesting schedule.",
      category: "financial",
    },
    {
      id: "b4",
      title: "Flexible & Unlimited Paid Time Off",
      description: "Encouraged minimum 25 days annual leave plus 12 official public holidays.",
      category: "pto",
    },
    {
      id: "b5",
      title: "Home Office & Hardware Stipend",
      description: "$1,500 one-time workspace setup allowance + top-spec MacBook Pro or workstation.",
      category: "equipment",
    },
    {
      id: "b6",
      title: "$2,500 Annual Learning Budget",
      description: "Dedicated budget for tech conferences, certifications, books, and professional courses.",
      category: "growth",
    },
  ];

  const jobsList: (typeof jobOpenings.$inferInsert)[] = [
    {
      id: job1,
      orgId,
      reqCode: "REQ-ENG-001",
      title: "Staff Backend Engineer",
      departmentId: deptEng,
      locationId: locSF,
      hiringManagerId: userHM,
      recruiterId: userRecruiter,
      employmentType: "full_time",
      workMode: "hybrid",
      experienceLevel: "senior",
      educationLevel: "bachelors",
      vacancies: 2,
      salaryMin: 180000,
      salaryMax: 220000,
      currency: "USD",
      payFrequency: "annual",
      isSalaryPublic: true,
      equityRange: "0.20% – 0.40% ISO Options",
      bonusStructure: "Up to 15% target performance bonus",
      relocationAssistance: "Visa sponsorship & $10,000 relocation stipend",
      status: "published",
      summary: "<p>We are seeking a Staff Backend Engineer to lead our high-throughput distributed systems and mission-critical microservices architecture.</p>",
      responsibilities: "<ul><li>Architect, develop, and maintain high-throughput backend services and APIs.</li><li>Collaborate with cross-functional teams to define technical scope and roadmap deliverables.</li><li>Mentor fellow engineers and conduct thorough, constructive code reviews.</li></ul>",
      requirements: "<ul><li>8+ years in Go, PostgreSQL, Kafka, and Kubernetes architecture.</li><li>Deep understanding of database optimization, distributed transactions, and event streaming.</li></ul>",
      niceToHave: "<ul><li>Experience with Terraform, AWS infrastructure, and microfrontends.</li></ul>",
      aboutTeam: "<p>We value engineering excellence, rapid iteration, and direct ownership in a collaborative culture.</p>",
      benefitsList: sampleBenefitsList,
      benefits: "Health & Dental, 401(k) Match, Equity Options, Unlimited PTO, Home Office Stipend",
      skills: ["Go", "PostgreSQL", "Kafka", "Kubernetes", "Distributed Systems"],
      secondarySkills: ["AWS", "Docker", "Terraform", "Redis"],
    },
    {
      id: job2,
      orgId,
      reqCode: "REQ-DSGN-002",
      title: "Lead Product Designer",
      departmentId: deptProd,
      locationId: locLondon,
      hiringManagerId: userInterviewer,
      recruiterId: userRecruiter,
      employmentType: "full_time",
      workMode: "on_site",
      experienceLevel: "lead_staff",
      educationLevel: "bachelors",
      vacancies: 1,
      salaryMin: 160000,
      salaryMax: 190000,
      currency: "USD",
      payFrequency: "annual",
      isSalaryPublic: true,
      equityRange: "0.15% – 0.30% ISO Options",
      bonusStructure: "10% annual performance bonus",
      relocationAssistance: "Full London visa and relocation support",
      status: "published",
      summary: "<p>Lead our design system, enterprise user experience, and interactive product workflow design across Web & Mobile applications.</p>",
      responsibilities: "<ul><li>Establish and scale our cross-platform design system tokens and component library.</li><li>Drive user research, usability testing, and wireframe prototyping for core features.</li><li>Partner closely with engineering to ensure seamless, pixel-perfect implementation.</li></ul>",
      requirements: "<ul><li>7+ years design system, user research, interaction design, and Figma expertise.</li><li>Portfolio exhibiting complex SaaS enterprise workflows.</li></ul>",
      niceToHave: "<ul><li>Prototyping with React, CSS, or Framer.</li></ul>",
      aboutTeam: "<p>Design-first culture where thoughtful craftsmanship and user empathy drive product decisions.</p>",
      benefitsList: sampleBenefitsList,
      benefits: "Health & Dental, 401(k) Match, Equity Options, Unlimited PTO, Home Office Stipend",
      skills: ["Figma", "Design Systems", "UI/UX", "User Research", "Prototyping"],
      secondarySkills: ["Tailwind CSS", "Interaction Design", "Framer"],
    },
    {
      id: job3,
      orgId,
      reqCode: "REQ-ENG-003",
      title: "Senior Frontend Engineer (React/Next.js)",
      departmentId: deptEng,
      locationId: locSF,
      hiringManagerId: userHM,
      recruiterId: userRecruiter,
      employmentType: "full_time",
      workMode: "remote",
      experienceLevel: "senior",
      educationLevel: "bachelors",
      vacancies: 3,
      salaryMin: 150000,
      salaryMax: 185000,
      currency: "USD",
      payFrequency: "annual",
      isSalaryPublic: true,
      equityRange: "0.10% – 0.25% ISO Options",
      bonusStructure: "10% annual target performance bonus",
      relocationAssistance: "Fully remote role with flexible global equipment allowance",
      status: "published",
      summary: "<p>Build cutting-edge React & Next.js microfrontends, high-performance interactive interfaces, and reusable components.</p>",
      responsibilities: "<ul><li>Develop responsive, accessible, and fast web applications using Next.js and TypeScript.</li><li>Optimize web performance, Core Web Vitals, and client-side caching.</li><li>Collaborate with designers to implement state-of-the-art interactive micro-animations.</li></ul>",
      requirements: "<ul><li>5+ years React, TypeScript, Next.js, and Tailwind CSS.</li><li>Strong background in state management, client performance, and REST/GraphQL APIs.</li></ul>",
      niceToHave: "<ul><li>Experience with WebSockets, Radix UI primitives, and Turbopack.</li></ul>",
      aboutTeam: "<p>Passionate frontend team focused on modern UI aesthetics and exceptional developer experience.</p>",
      benefitsList: sampleBenefitsList,
      benefits: "Health & Dental, 401(k) Match, Equity Options, Unlimited PTO, Home Office Stipend",
      skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "State Management"],
      secondarySkills: ["GraphQL", "WebSockets", "Jest", "Radix UI"],
    },
  ];

  for (const j of jobsList) {
    await db
      .insert(jobOpenings)
      .values(j)
      .onConflictDoUpdate({
        target: jobOpenings.id,
        set: {
          title: j.title,
          reqCode: j.reqCode,
          departmentId: j.departmentId,
          locationId: j.locationId,
          hiringManagerId: j.hiringManagerId,
          recruiterId: j.recruiterId,
          employmentType: j.employmentType,
          workMode: j.workMode,
          experienceLevel: j.experienceLevel,
          educationLevel: j.educationLevel,
          vacancies: j.vacancies,
          salaryMin: j.salaryMin,
          salaryMax: j.salaryMax,
          currency: j.currency,
          payFrequency: j.payFrequency,
          isSalaryPublic: j.isSalaryPublic,
          equityRange: j.equityRange,
          bonusStructure: j.bonusStructure,
          relocationAssistance: j.relocationAssistance,
          status: j.status,
          summary: j.summary,
          responsibilities: j.responsibilities,
          requirements: j.requirements,
          niceToHave: j.niceToHave,
          aboutTeam: j.aboutTeam,
          benefitsList: j.benefitsList,
          benefits: j.benefits,
          skills: j.skills,
          secondarySkills: j.secondarySkills,
        },
      });
  }

  console.log("✓ Job Requisitions created & updated with structured benefits");

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
