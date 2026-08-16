import { APP_NAVIGATION, NavDef } from "./registry";

export interface NavNodeView {
  label: string;
  href: string;
  icon?: string;
  badge?: number;
  badgeKey?: string;
  children?: { label: string; href: string; badge?: number; badgeKey?: string }[];
}

export interface QuickAction {
  label: string;
  href: string;
  icon: string;
  description: string;
}

export const RECRUITMENT_QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Create Job Opening",
    href: "/jobs/new",
    icon: "Briefcase",
    description: "Post a new vacancy and configure requirements",
  },
  {
    label: "Add Candidate",
    href: "/candidates/new",
    icon: "UserPlus",
    description: "Direct candidate profile or resume upload",
  },
  {
    label: "Schedule Interview",
    href: "/interviews/schedule",
    icon: "CalendarDays",
    description: "Book panel round with calendar sync",
  },
  {
    label: "Create Offer Letter",
    href: "/offers/new",
    icon: "FileCheck",
    description: "Generate salary package and offer terms",
  },
  {
    label: "View Pipeline Kanban",
    href: "/applications",
    icon: "Layers",
    description: "Move applicants across hiring stages",
  },
];

export function getNavigation(
  badges: Record<string, number> = {},
  userRole?: string,
  userPermissions?: string[],
): NavNodeView[] {
  const isSuperAdmin = userRole === "system_admin";
  const permissionsSet = new Set(userPermissions || []);

  const hasAccess = (requiredPerm?: string, requiredPerms?: string[]): boolean => {
    if (isSuperAdmin) return true;
    if (!requiredPerm && (!requiredPerms || requiredPerms.length === 0)) return true;
    if (requiredPerm && permissionsSet.has(requiredPerm)) return true;
    if (requiredPerms && requiredPerms.some((p) => permissionsSet.has(p))) return true;
    return false;
  };

  return APP_NAVIGATION.filter((item) => hasAccess(item.permission, item.permissions))
    .map((item) => {
      const parentBadge = item.badgeKey ? badges[item.badgeKey] : undefined;
      const filteredChildren = item.children
        ?.filter((child) => hasAccess(child.permission, child.permissions))
        .map((child) => ({
          label: child.label,
          href: child.href,
          badge: child.badgeKey ? badges[child.badgeKey] : undefined,
          badgeKey: child.badgeKey,
        }));

      return {
        label: item.label,
        href: item.href,
        icon: item.icon,
        badge: parentBadge,
        badgeKey: item.badgeKey,
        children: filteredChildren && filteredChildren.length > 0 ? filteredChildren : undefined,
      };
    });
}
