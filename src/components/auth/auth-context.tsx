"use client";

import React, { createContext, useContext, useMemo } from "react";
import type { Permission } from "@/lib/auth/rbac";

export interface ClientAuthUser {
  id: string;
  orgId: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  departmentId: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  organizationName: string;
}

interface AuthContextValue {
  user: ClientAuthUser | null;
  role: string;
  permissions: string[];
  isSuperAdmin: boolean;
  canManageRBAC: boolean;
  hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: "recruiter",
  permissions: [],
  isSuperAdmin: false,
  canManageRBAC: false,
  hasPermission: () => false,
});

export function AuthProvider({
  user,
  children,
}: {
  user: ClientAuthUser | null;
  children: React.ReactNode;
}) {
  const value = useMemo(() => {
    const role = user?.role || "anonymous";
    const permissions = user?.permissions || [];
    const isSuperAdmin = role === "system_admin";
    const canManageRBAC = isSuperAdmin || permissions.includes("canAssignRoles");

    const checkPermission = (perm: Permission): boolean => {
      if (isSuperAdmin) return true;
      return permissions.includes(perm);
    };

    return {
      user,
      role,
      permissions,
      isSuperAdmin,
      canManageRBAC,
      hasPermission: checkPermission,
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
