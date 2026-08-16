import { AppShell } from "@/components/layout/app-shell";
import { getNavigation } from "@/lib/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { AuthProvider } from "@/components/auth/auth-context";

const ROLE_LABELS: Record<string, string> = {
  system_admin: "System Administrator",
  hr_admin: "HR Administrator",
  recruiter: "Lead Talent Partner",
  hiring_manager: "Hiring Manager",
  interviewer: "Interview Panelist",
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  const departments = [
    { id: "dept_all", name: "All Departments", code: "ALL", location: "Global" },
    { id: "dept_eng", name: "Engineering & Tech", code: "ENG", location: "San Francisco / Remote" },
    { id: "dept_prod", name: "Product & Design", code: "PRD", location: "New York" },
    { id: "dept_sales", name: "Sales & Growth", code: "SLS", location: "London" },
    { id: "dept_ops", name: "Operations & HR", code: "OPS", location: "Singapore" },
  ];

  const userRole = currentUser?.role || "recruiter";
  const userPermissions = currentUser?.permissions || [];

  const user = {
    id: currentUser?.id || "usr_recruiter_01",
    name: currentUser?.name || "Recruiter",
    email: currentUser?.email || "recruiter@myorganisation.com",
    roleLabel: ROLE_LABELS[userRole] || userRole.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  };

  const badges = {
    openJobs: 18,
    activeApplications: 142,
    screeningCount: 38,
    interviewsToday: 8,
    pendingFeedback: 5,
  };

  // Pass dynamic role and permissions to filter navigation
  const navigation = getNavigation(badges, userRole, userPermissions);

  return (
    <AuthProvider user={currentUser}>
      <AppShell
        organizationName={currentUser?.organizationName || "My Organisation"}
        navigation={navigation}
        user={user}
        departments={departments}
        activeDepartmentId="dept_all"
        unreadCount={6}
      >
        {children}
      </AppShell>
    </AuthProvider>
  );
}
