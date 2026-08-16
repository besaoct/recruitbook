/**
 * Universal Dynamic Role-Based Access Control (RBAC) System
 * Supports database-persisted roles, custom role creation, and real-time permission toggling.
 */

export type UserRole = string;

export type Permission =
  | "canManageSettings"
  | "canManageUsers"
  | "canAssignRoles"
  | "canManageDepartments"
  | "canCreateJobs"
  | "canEditJobs"
  | "canDeleteJobs"
  | "canManageCandidates"
  | "canAdvancePipeline"
  | "canScheduleInterviews"
  | "canSubmitScorecard"
  | "canViewScorecards"
  | "canCreateOffers"
  | "canApproveOffers"
  | "canViewSalaries"
  | "canSendCommunications"
  | "canSyncHRM"
  | "canViewReports";

export interface PermissionDefinition {
  key: Permission;
  label: string;
  category: "admin" | "jobs" | "candidates" | "interviews" | "offers" | "analytics";
  description: string;
}

export const PERMISSION_CATEGORIES: { id: string; name: string; description: string }[] = [
  { id: "admin", name: "System & User Administration", description: "Manage organization details, user access, and role permissions" },
  { id: "jobs", name: "Job Requisitions & Openings", description: "Create, edit, duplicate, and publish hiring requisitions" },
  { id: "candidates", name: "Candidate Pipeline & ATS", description: "Manage applicants, move pipeline stages, and send candidate emails" },
  { id: "interviews", name: "Interviews & Panel Scorecards", description: "Schedule interview rounds and submit structured evaluations" },
  { id: "offers", name: "Offers & HRM Synchronization", description: "Draft compensation packages, route approvals, and sync to HRM" },
  { id: "analytics", name: "Analytics & Reports", description: "View recruitment metrics, time-to-hire, and channel yield" },
];

export const ALL_PERMISSIONS: PermissionDefinition[] = [
  // Admin & Org
  {
    key: "canManageSettings",
    category: "admin",
    label: "Manage Company & Settings",
    description: "Configure company identity, branding, careers subdomain, and integrations",
  },
  {
    key: "canManageUsers",
    category: "admin",
    label: "Manage User Accounts",
    description: "Create, activate, deactivate, and remove user accounts",
  },
  {
    key: "canAssignRoles",
    category: "admin",
    label: "Manage Roles & Permissions",
    description: "Create custom roles, edit permission matrices, and assign roles to users",
  },
  {
    key: "canManageDepartments",
    category: "admin",
    label: "Manage Departments & Locations",
    description: "Configure corporate departments and global office hubs",
  },

  // Jobs
  {
    key: "canCreateJobs",
    category: "jobs",
    label: "Create Job Requisitions",
    description: "Open new hiring requisitions and publish to the public careers portal",
  },
  {
    key: "canEditJobs",
    category: "jobs",
    label: "Edit Requisitions",
    description: "Modify job descriptions, salary bands, and vacancy counts",
  },
  {
    key: "canDeleteJobs",
    category: "jobs",
    label: "Delete Requisitions",
    description: "Permanently delete or archive job requisitions",
  },

  // Candidates & Pipeline
  {
    key: "canManageCandidates",
    category: "candidates",
    label: "Manage Candidates Directory",
    description: "Direct candidate profile creation, talent pool curation, and edits",
  },
  {
    key: "canAdvancePipeline",
    category: "candidates",
    label: "Advance ATS Pipeline Stages",
    description: "Transition applicants across the 8-stage ATS recruitment Kanban",
  },
  {
    key: "canSendCommunications",
    category: "candidates",
    label: "Send Candidate Emails",
    description: "Dispatch automated email templates and direct candidate messages",
  },

  // Interviews
  {
    key: "canScheduleInterviews",
    category: "interviews",
    label: "Schedule Panel Interviews",
    description: "Book interview rounds, generate meeting links, and notify interviewers",
  },
  {
    key: "canSubmitScorecard",
    category: "interviews",
    label: "Submit Evaluation Scorecards",
    description: "Record structured interview ratings, signals, and hiring recommendations",
  },
  {
    key: "canViewScorecards",
    category: "interviews",
    label: "View Panel Scorecards",
    description: "Review evaluation feedback and signals from other interview panel members",
  },

  // Offers & HRM
  {
    key: "canCreateOffers",
    category: "offers",
    label: "Create Offer Packages",
    description: "Draft official employment offer letters with compensation and perks",
  },
  {
    key: "canApproveOffers",
    category: "offers",
    label: "Approve Offers",
    description: "Executive and hiring manager sign-off on compensation packages",
  },
  {
    key: "canViewSalaries",
    category: "offers",
    label: "View Salary & Compensation",
    description: "Access candidate salary expectations and requisition budgets",
  },
  {
    key: "canSyncHRM",
    category: "offers",
    label: "Synchronize to HRM",
    description: "Auto-onboard accepted candidates directly to HRM and Payroll",
  },

  // Analytics
  {
    key: "canViewReports",
    category: "analytics",
    label: "View Analytics & Reports",
    description: "Access hiring velocity, time-to-hire, and source channel yield reports",
  },
];

/**
 * Baseline fallback permissions if database is offline or during initial bootstrap
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<string, Permission[]> = {
  system_admin: ALL_PERMISSIONS.map((p) => p.key),
  hr_admin: [
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
  recruiter: [
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
  hiring_manager: [
    "canAdvancePipeline",
    "canSubmitScorecard",
    "canViewScorecards",
    "canApproveOffers",
    "canViewSalaries",
    "canViewReports",
  ],
  interviewer: [
    "canSubmitScorecard",
    "canViewScorecards",
  ],
};

export const DEFAULT_ROLE_LABELS: Record<string, { title: string; description: string; badge: string }> = {
  system_admin: {
    title: "System Administrator",
    description: "Universal control over organization settings, RBAC role assignment, integrations, and all ATS modules.",
    badge: "Super Admin",
  },
  hr_admin: {
    title: "HR Administrator",
    description: "Full control over departments, user directory, candidate offers, HRM employee sync, and compliance reports.",
    badge: "HR Admin",
  },
  recruiter: {
    title: "Recruiter",
    description: "Full requisition management, ATS candidate pipeline progression, interview coordination, and offer generation.",
    badge: "Recruiter",
  },
  hiring_manager: {
    title: "Hiring Manager",
    description: "Department candidate review, scorecard evaluation, and offer approvals for open team positions.",
    badge: "Hiring Lead",
  },
  interviewer: {
    title: "Interviewer",
    description: "Assigned panel interview participation, resume access, and structured scorecard rating submission.",
    badge: "Interviewer",
  },
};

/**
 * Dynamic permission check function
 */
export function hasPermission(
  role: string | null | undefined,
  permission: Permission,
  customRolePermissions?: string[],
): boolean {
  if (!role) return false;
  if (role === "system_admin") return true;

  // If custom permissions array is provided (from database query)
  if (customRolePermissions && Array.isArray(customRolePermissions)) {
    return customRolePermissions.includes(permission);
  }

  // Fallback to default role map
  const fallbackList = DEFAULT_ROLE_PERMISSIONS[role];
  if (fallbackList) {
    return fallbackList.includes(permission);
  }

  return false;
}

/**
 * Server Action / API permission assertion helper
 */
export function assertPermission(
  role: string | null | undefined,
  permission: Permission,
  customRolePermissions?: string[],
): void {
  if (!hasPermission(role, permission, customRolePermissions)) {
    throw new Error(`Access Denied: Role '${role || "anonymous"}' lacks the required permission '${permission}'`);
  }
}
