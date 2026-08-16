"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "./auth-context";
import { getRoutePermissions } from "@/lib/registry";
import { AccessDenied } from "./access-denied";

export function RoutePermissionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const auth = useAuth();

  // Super Admin / system_admin bypasses all route rules
  if (auth.isSuperAdmin || auth.role === "system_admin") {
    return <>{children}</>;
  }

  const requirement = getRoutePermissions(pathname);

  // If no specific permission is required for this route, allow access by default
  if (!requirement || requirement.permissions.length === 0) {
    return <>{children}</>;
  }

  // Evaluate permissions dynamically
  if (requirement.mode === "all") {
    const hasAll = requirement.permissions.every((p) => auth.hasPermission(p as any));
    if (!hasAll) {
      return (
        <AccessDenied
          errorCode="403"
          title="Access Denied"
          description="You do not have permission to view or access this section."
        />
      );
    }
  } else {
    // Mode 'any': at least one permission grants access
    const hasAny = requirement.permissions.some((p) => auth.hasPermission(p as any));
    if (!hasAny) {
      return (
        <AccessDenied
          errorCode="403"
          title="Access Denied"
          description="You do not have permission to view or access this section."
        />
      );
    }
  }

  return <>{children}</>;
}
