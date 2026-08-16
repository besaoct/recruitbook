"use client";

import React from "react";
import { type Permission, type UserRole, hasPermission as checkRolePerm } from "@/lib/auth/rbac";
import { useAuth } from "./auth-context";

interface RoleGuardProps {
  /** Optional override for role (defaults to current user role) */
  userRole?: UserRole | string | null;
  /** Granular permission required to render children */
  permission?: Permission;
  /** List of allowed roles */
  allowedRoles?: (UserRole | string)[];
  /** Content to render if authorized */
  children: React.ReactNode;
  /** Fallback content if unauthorized (defaults to null) */
  fallback?: React.ReactNode;
}

/**
 * Inline Component RBAC Guard
 * Used for conditionally rendering UI buttons, tabs, sensitive fields, or action menus.
 */
export function RoleGuard({
  userRole,
  permission,
  allowedRoles,
  children,
  fallback = null,
}: RoleGuardProps) {
  const auth = useAuth();
  const effectiveRole = userRole !== undefined ? userRole : auth.role;

  // Super Admin / system_admin bypass
  if (auth.isSuperAdmin || effectiveRole === "system_admin") {
    return <>{children}</>;
  }

  // Permission check
  if (permission) {
    if (userRole !== undefined) {
      if (!checkRolePerm(userRole, permission)) return <>{fallback}</>;
    } else {
      if (!auth.hasPermission(permission)) return <>{fallback}</>;
    }
  }

  // Allowed roles check
  if (allowedRoles && allowedRoles.length > 0) {
    if (!effectiveRole || !allowedRoles.includes(effectiveRole)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
