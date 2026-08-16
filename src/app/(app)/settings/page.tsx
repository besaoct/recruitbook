"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import {
  CheckCircle2,
  Copy,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  ShieldCheck,
  MapPin,
  Lock,
  UserPlus,
  Check,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  getOrganizationSettings,
  updateOrganizationSettings,
  getUsers,
  createUser,
  updateUserRole,
  toggleUserActive,
  deleteUser,
  getDepartments,
  createDepartment,
  deleteDepartment,
  getLocations,
  createLocation,
  deleteLocation,
} from "@/lib/actions/settings";
import {
  getRoles,
  createRole,
  updateRole,
  toggleRolePermission,
  deleteRole,
  type RoleWithUsers,
} from "@/lib/actions/roles";
import {
  ALL_PERMISSIONS,
  PERMISSION_CATEGORIES,
  type Permission,
} from "@/lib/auth/rbac";
import { RoleGuard } from "@/components/auth/role-guard";
import { useAuth } from "@/components/auth/auth-context";
import { AccessDenied } from "@/components/auth/access-denied";

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const { isSuperAdmin, canManageRBAC, hasPermission } = useAuth();

  const normalizeTab = (tab: string | null): string => {
    if (!tab || tab === "company") return "company";
    if (tab === "users" || tab === "roles") return "users";
    if (tab === "rbac" || tab === "permissions") return "rbac";
    if (tab === "departments") return "departments";
    if (tab === "locations") return "locations";
    if (tab === "integrations") return "integrations";
    return "company";
  };

  const [activeTab, setActiveTab] = useState(normalizeTab(rawTab));

  // Data states
  const [, setOrg] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [rolesList, setRolesList] = useState<RoleWithUsers[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [, setLoading] = useState(true);

  // Org form state
  const [orgName, setOrgName] = useState("");
  const [careersDomain, setCareersDomain] = useState("careers.myorganisation.com");
  const [timezone, setTimezone] = useState("America/Los_Angeles");
  const [isSavingOrg, setIsSavingOrg] = useState(false);

  // Create Role Modal
  const [createRoleModalOpen, setCreateRoleModalOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [roleSlug, setRoleSlug] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [roleBadge, setRoleBadge] = useState("Custom");
  const [rolePerms, setRolePerms] = useState<Set<Permission>>(new Set());
  const [isCreatingRole, setIsCreatingRole] = useState(false);

  // Edit Role Modal
  const [editingRole, setEditingRole] = useState<RoleWithUsers | null>(null);
  const [editRoleName, setEditRoleName] = useState("");
  const [editRoleDesc, setEditRoleDesc] = useState("");
  const [editRoleBadge, setEditRoleBadge] = useState("");
  const [editRolePerms, setEditRolePerms] = useState<Set<Permission>>(new Set());
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Matrix cell toggling state
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  // Add User Modal
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("RecruitBook2026!");
  const [newUserRole, setNewUserRole] = useState<string>("recruiter");
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Add Department Modal
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptCode, setNewDeptCode] = useState("");
  const [isCreatingDept, setIsCreatingDept] = useState(false);

  // Add Location Modal
  const [locModalOpen, setLocModalOpen] = useState(false);
  const [newLocName, setNewLocName] = useState("");
  const [newLocCity, setNewLocCity] = useState("");
  const [newLocCountry, setNewLocCountry] = useState("United States");
  const [isCreatingLoc, setIsCreatingLoc] = useState(false);

  const [copied, setCopied] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [orgData, uList, rList, dList, lList] = await Promise.all([
        getOrganizationSettings(),
        getUsers(),
        getRoles(),
        getDepartments(),
        getLocations(),
      ]);
      setOrg(orgData);
      if (orgData) {
        setOrgName(orgData.name || "My Organisation");
        setCareersDomain(orgData.careersDomain || "careers.myorganisation.com");
        setTimezone(orgData.timezone || "America/Los_Angeles");
      }
      setUsersList(uList);
      setRolesList(rList);
      if (rList[0] && !newUserRole) {
        setNewUserRole(rList[0].slug);
      }
      setDepartments(dList);
      setLocations(lList);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load settings data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setActiveTab(normalizeTab(rawTab));
  }, [rawTab]);

  useEffect(() => {
    loadAll();
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const targetUrl = value === "company" ? "/settings" : `/settings?tab=${value}`;
    router.replace(targetUrl);
  };

  const handleSaveOrg = async () => {
    setIsSavingOrg(true);
    try {
      await updateOrganizationSettings({
        name: orgName,
        careersDomain,
        timezone,
      });
      toast.success("Organization details saved!");
      await loadAll();
    } catch {
      toast.error("Failed to update organization");
    } finally {
      setIsSavingOrg(false);
    }
  };

  // ---------------------------------------------------------------------------
  // ROLE CRUD HANDLERS
  // ---------------------------------------------------------------------------
  const handleOpenCreateRole = () => {
    setRoleName("");
    setRoleSlug("");
    setRoleDesc("");
    setRoleBadge("Custom");
    setRolePerms(new Set(["canManageCandidates", "canAdvancePipeline", "canViewScorecards"]));
    setCreateRoleModalOpen(true);
  };

  const handleCreateRole = async () => {
    if (!roleName.trim()) {
      toast.error("Please enter a role title");
      return;
    }
    setIsCreatingRole(true);
    try {
      await createRole({
        name: roleName,
        slug: roleSlug || undefined,
        description: roleDesc,
        badge: roleBadge,
        permissions: Array.from(rolePerms),
      });
      toast.success(`Custom role '${roleName}' created with ${rolePerms.size} permissions!`);
      setCreateRoleModalOpen(false);
      await loadAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to create custom role");
    } finally {
      setIsCreatingRole(false);
    }
  };

  const handleOpenEditRole = (r: RoleWithUsers) => {
    if (r.slug === "system_admin") {
      toast.info("The root System Administrator role is strictly read-only and cannot be modified.");
      return;
    }
    setEditingRole(r);
    setEditRoleName(r.name);
    setEditRoleDesc(r.description || "");
    setEditRoleBadge(r.badge || "Custom");
    setEditRolePerms(new Set(r.permissions as Permission[]));
  };

  const handleSaveEditRole = async () => {
    if (!editingRole) return;
    setIsUpdatingRole(true);
    try {
      await updateRole(editingRole.id, {
        name: editRoleName,
        description: editRoleDesc,
        badge: editRoleBadge,
        permissions: Array.from(editRolePerms),
      });
      toast.success(`Role '${editRoleName}' updated successfully!`);
      setEditingRole(null);
      await loadAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to update role");
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleDeleteRole = async (r: RoleWithUsers) => {
    if (r.slug === "system_admin" || r.isSystem) {
      toast.error("System Administrator is the root system role and cannot be deleted.");
      return;
    }
    if (!confirm(`Are you sure you want to permanently delete custom role '${r.name}'?`)) return;
    try {
      await deleteRole(r.id);
      toast.success(`Role '${r.name}' deleted.`);
      await loadAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete role");
    }
  };

  // 1-Click Matrix Toggle
  const handleMatrixToggle = async (role: RoleWithUsers, permKey: Permission) => {
    if (role.slug === "system_admin") {
      toast.info("The root System Administrator maintains all permissions permanently (Read-Only).");
      return;
    }

    const isGranted = (role.permissions as string[]).includes(permKey);
    const keyId = `${role.id}_${permKey}`;
    setTogglingKey(keyId);

    // Optimistic UI update
    setRolesList((prev) =>
      prev.map((r) => {
        if (r.id !== role.id) return r;
        const updated = isGranted
          ? r.permissions.filter((p) => p !== permKey)
          : [...r.permissions, permKey];
        return { ...r, permissions: updated };
      }),
    );

    try {
      await toggleRolePermission(role.id, permKey, !isGranted);
      toast.success(
        !isGranted
          ? `Granted '${permKey}' to ${role.name}`
          : `Revoked '${permKey}' from ${role.name}`,
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle permission");
      await loadAll();
    } finally {
      setTogglingKey(null);
    }
  };

  // ---------------------------------------------------------------------------
  // USER CRUD HANDLERS
  // ---------------------------------------------------------------------------
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      toast.success("User role updated!");
      await loadAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to update user role");
    }
  };

  const handleToggleUserActive = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleUserActive(userId, !currentStatus);
      toast.success(currentStatus ? "User deactivated" : "User activated");
      await loadAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle status");
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`Delete user account "${name}"?`)) return;
    try {
      await deleteUser(userId);
      toast.success(`User ${name} deleted`);
      await loadAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    }
  };

  const handleCreateUser = async () => {
    if (!newUserName || !newUserEmail || !newUserPassword) {
      toast.error("Please fill in name, email, and password");
      return;
    }
    setIsCreatingUser(true);
    try {
      await createUser({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
      });
      toast.success(`User account for ${newUserName} created!`);
      setUserModalOpen(false);
      setNewUserName("");
      setNewUserEmail("");
      await loadAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to create user");
    } finally {
      setIsCreatingUser(false);
    }
  };

  // ---------------------------------------------------------------------------
  // DEPARTMENT & LOCATION HANDLERS
  // ---------------------------------------------------------------------------
  const handleCreateDept = async () => {
    if (!newDeptName || !newDeptCode) {
      toast.error("Please fill in department name and code");
      return;
    }
    setIsCreatingDept(true);
    try {
      await createDepartment({
        name: newDeptName,
        code: newDeptCode.toUpperCase(),
      });
      toast.success(`Department "${newDeptName}" added`);
      setDeptModalOpen(false);
      setNewDeptName("");
      setNewDeptCode("");
      await loadAll();
    } catch {
      toast.error("Failed to add department");
    } finally {
      setIsCreatingDept(false);
    }
  };

  const handleDeleteDept = async (id: string, name: string) => {
    if (!confirm(`Delete department "${name}"?`)) return;
    try {
      await deleteDepartment(id);
      toast.success("Department removed");
      await loadAll();
    } catch {
      toast.error("Failed to delete department");
    }
  };

  const handleCreateLoc = async () => {
    if (!newLocName || !newLocCity) {
      toast.error("Please fill in location title and city");
      return;
    }
    setIsCreatingLoc(true);
    try {
      await createLocation({
        name: newLocName,
        city: newLocCity,
        country: newLocCountry,
      });
      toast.success(`Location "${newLocName}" added`);
      setLocModalOpen(false);
      setNewLocName("");
      setNewLocCity("");
      await loadAll();
    } catch {
      toast.error("Failed to add location");
    } finally {
      setIsCreatingLoc(false);
    }
  };

  const handleDeleteLoc = async (id: string, name: string) => {
    if (!confirm(`Delete location "${name}"?`)) return;
    try {
      await deleteLocation(id);
      toast.success("Location removed");
      await loadAll();
    } catch {
      toast.error("Failed to delete location");
    }
  };

  const embedCodeSnippet = `// 1. Host Application React Microfrontend Import
import { RecruitBookEmbedContainer, CandidatePipelineEmbed } from "@recruitbook/embed-sdk";

export function HostHrmRecruitmentView() {
  return (
    <RecruitBookEmbedContainer
      config={{
        isEmbedded: true,
        hostName: "My Organisation HRM & Payroll Suite",
        theme: "light",
        onCandidateHired: (candidate) => {
          console.log("Candidate converted to HRM Employee:", candidate);
        },
      }}
    >
      <CandidatePipelineEmbed departmentId="dept_eng" />
    </RecruitBookEmbedContainer>
  );
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCodeSnippet);
    setCopied(true);
    toast.success("Microfrontend embed snippet copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const canViewCompany = isSuperAdmin || hasPermission("canManageSettings");
  const canViewRBAC = canManageRBAC;
  const canViewUsers = isSuperAdmin || hasPermission("canManageUsers") || canManageRBAC;
  const canViewDepts = isSuperAdmin || hasPermission("canManageDepartments");
  const canViewLocations = isSuperAdmin || hasPermission("canManageSettings");
  const canViewSDK = isSuperAdmin || hasPermission("canManageSettings");
  return (
    <div className="page max-w-full">
      <PageHeader
        title="System &amp; Access Control Settings"
        description="Manage company details, dynamic database-persisted RBAC roles, live permission matrices, departments, and HRM microfrontend bridges."
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="mb-2">
          {canViewCompany && (
            <TabsTrigger value="company">
              Company &amp; Branding
            </TabsTrigger>
          )}
          {canViewRBAC && (
            <TabsTrigger value="rbac" className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-copper" />
              <span>Roles &amp; Permissions (RBAC)</span>
            </TabsTrigger>
          )}
          {canViewUsers && (
            <TabsTrigger value="users">
              Users &amp; Directory ({usersList.length})
            </TabsTrigger>
          )}
          {canViewDepts && (
            <TabsTrigger value="departments">
              Departments ({departments.length})
            </TabsTrigger>
          )}
          {canViewLocations && (
            <TabsTrigger value="locations">
              Locations ({locations.length})
            </TabsTrigger>
          )}
          {canViewSDK && (
            <TabsTrigger value="integrations">
              Microfrontend SDK
            </TabsTrigger>
          )}
        </TabsList>

        {/* 1. COMPANY & BRANDING */}
        {canViewCompany && (
          <TabsContent value="company" className="space-y-4">
            <Card className="shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Organization Profile</CardTitle>
                <CardDescription className="text-xs">
                  Company identity shown on applicant portal and offer letters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs max-w-xl">
                <div className="space-y-1.5">
                  <label className="field-label">Organization Name</label>
                  <Input
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="field-label">Careers Portal Subdomain</label>
                  <Input
                    value={careersDomain}
                    onChange={(e) => setCareersDomain(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="field-label">Primary Timezone</label>
                  <Input
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    size="xs"
                    variant="accent"
                    disabled={isSavingOrg}
                    onClick={handleSaveOrg}
                    className="gap-1"
                  >
                    {isSavingOrg ? <Loader2 className="size-3 animate-spin" /> : null}
                    <span>Save Organization Profile</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* 2. DYNAMIC RBAC ROLES & PERMISSIONS */}
        <TabsContent value="rbac" className="space-y-6">
          {!canViewRBAC ? (
            <AccessDenied
              errorCode="403"
              title="Access Denied"
              description="You do not have permission to view or manage RBAC roles."
              showBackHome={false}
            />
          ) : (
            <>
              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-card rounded-xs border border-border">
                <div className="space-y-0.5">
                  <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="size-4 text-copper" />
                    <span>Dynamic Database-Driven Roles &amp; Permissions</span>
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Create custom roles, delegate role governance, and customize granular permissions across all modules.
                  </p>
                </div>
                <RoleGuard permission="canAssignRoles">
                  <Button
                    size="sm"
                    variant="accent"
                    onClick={handleOpenCreateRole}
                    className="gap-1 text-xs shrink-0"
                  >
                    <Plus className="size-3.5" />
                    <span>Create Custom Role</span>
                  </Button>
                </RoleGuard>
              </div>

              {/* Roles Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {rolesList.map((r) => {
                  const isRootAdmin = r.slug === "system_admin";
                  return (
                    <Card
                      key={r.id}
                      className="shadow-none border border-border hover:border-copper/60 transition-all flex flex-col justify-between"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-sm font-semibold">{r.name}</CardTitle>
                              {isRootAdmin ? (
                                <Badge
                                  variant="secondary"
                                  className="text-[9px] uppercase tracking-wider bg-copper/10 text-copper border-copper/30 flex items-center gap-1"
                                >
                                  <Lock className="size-2.5" />
                                  <span>Read-Only Root</span>
                                </Badge>
                              ) : (
                                <Badge
                                  variant={r.isSystem ? "secondary" : "soft-success"}
                                  className="text-[9px] uppercase tracking-wider"
                                >
                                  {r.isSystem ? "System" : "Custom"}
                                </Badge>
                              )}
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              slug: {r.slug}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-medium">
                            {r.userCount || 0} {(r.userCount || 0) === 1 ? "user" : "users"}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs line-clamp-2 mt-1">
                          {isRootAdmin
                            ? "Universal administrator with permanent full permissions across all systems. Strictly read-only for all users."
                            : r.description || "Custom defined role with tailored permissions."}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-3 pt-2 text-xs">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border pt-2">
                          <span>
                            <strong className="text-foreground">
                              {isRootAdmin ? ALL_PERMISSIONS.length : r.permissions.length}
                            </strong>{" "}
                            of {ALL_PERMISSIONS.length} permissions granted
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {r.badge || "Role"}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-border/60">
                          {isRootAdmin ? (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground gap-1 h-7 px-2 bg-muted/30">
                              <Lock className="size-3 text-copper" />
                              <span>Read-Only</span>
                            </Badge>
                          ) : (
                            <RoleGuard permission="canAssignRoles">
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => handleOpenEditRole(r)}
                                className="h-7 px-2.5 text-xs gap-1"
                              >
                                <Edit2 className="size-3" />
                                <span>Edit Permissions</span>
                              </Button>

                              {!r.isSystem && (
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  onClick={() => handleDeleteRole(r)}
                                  className="h-7 w-7 p-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                                  title="Delete Custom Role"
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              )}
                            </RoleGuard>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Live RBAC Permission Matrix */}
              <Card className="shadow-none overflow-hidden">
                <CardHeader className="pb-3 border-b border-border bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <ShieldCheck className="size-4 text-copper" />
                        <span>Interactive Real-Time RBAC Permission Matrix</span>
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Click any cell to immediately grant or revoke permissions on Neon PostgreSQL database
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Check className="size-3 text-success font-bold" />
                        <span>Granted</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <X className="size-3 text-muted-foreground/40 font-bold" />
                        <span>Denied</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Lock className="size-3 text-copper" />
                        <span>Read-Only</span>
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="text-xs bg-muted/40">
                        <TableHead className="w-80 min-w-[280px]">Feature &amp; Capability</TableHead>
                        {rolesList.map((r) => (
                          <TableHead key={r.id} className="text-center min-w-[120px]">
                            <div>
                              <span className="font-semibold text-foreground text-xs block">{r.name}</span>
                              <span className="text-[9px] text-muted-foreground">
                                {r.slug === "system_admin" ? "read-only root" : r.isSystem ? "system" : "custom"}
                              </span>
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {PERMISSION_CATEGORIES.map((cat) => {
                        const catPerms = ALL_PERMISSIONS.filter((p) => p.category === cat.id);
                        return (
                          <React.Fragment key={cat.id}>
                            {/* Category Divider Header */}
                            <TableRow className="bg-muted/60 text-xs font-semibold text-foreground">
                              <TableCell colSpan={rolesList.length + 1} className="py-1.5 text-copper uppercase tracking-wider text-[10px]">
                                {cat.name}
                              </TableCell>
                            </TableRow>

                            {/* Category Permissions */}
                            {catPerms.map((perm) => (
                              <TableRow key={perm.key} className="text-xs hover:bg-muted/30 transition-colors">
                                <TableCell className="font-medium">
                                  <div className="font-semibold text-foreground text-xs">{perm.label}</div>
                                  <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                                    {perm.description}
                                  </div>
                                </TableCell>
                                {rolesList.map((r) => {
                                  const isRootAdmin = r.slug === "system_admin";
                                  const isGranted = isRootAdmin || (r.permissions as string[]).includes(perm.key);
                                  const isCellToggling = togglingKey === `${r.id}_${perm.key}`;

                                  if (isRootAdmin) {
                                    return (
                                      <TableCell key={r.id} className="text-center">
                                        <div
                                          className="inline-flex items-center justify-center size-6 rounded-xs bg-copper/10 border border-copper/30 text-copper cursor-not-allowed"
                                          title="System Administrator maintains full access and is permanently read-only / immutable."
                                        >
                                          <Check className="size-3.5 stroke-[2.5]" />
                                        </div>
                                      </TableCell>
                                    );
                                  }

                                  return (
                                    <TableCell key={r.id} className="text-center">
                                      <button
                                        onClick={() => handleMatrixToggle(r, perm.key)}
                                        disabled={isCellToggling}
                                        title={`Click to ${isGranted ? "revoke" : "grant"} ${perm.label} for ${r.name}`}
                                        className={`inline-flex items-center justify-center size-6 rounded-xs border transition-all ${ isGranted ? "bg-success/15 border-success/40 text-success hover:bg-destructive/20 hover:text-destructive hover:border-destructive" : "bg-muted/40 border-border text-muted-foreground/30 hover:bg-success/20 hover:text-success hover:border-success" }`}
                                      >
                                        {isCellToggling ? (
                                          <Loader2 className="size-3 animate-spin text-copper" />
                                        ) : isGranted ? (
                                          <Check className="size-3.5 stroke-[2.5]" />
                                        ) : (
                                          <X className="size-3 stroke-[2]" />
                                        )}
                                      </button>
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            ))}
                          </React.Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* 3. USERS & DIRECTORY */}
        {canViewUsers && (
          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Manage system users and assign dynamic roles in real time.
              </div>
              <RoleGuard permission="canManageUsers">
                <Button
                  size="sm"
                  variant="accent"
                  onClick={() => setUserModalOpen(true)}
                  className="gap-1 text-xs"
                >
                  <UserPlus className="size-3.5" />
                  <span>Add User Account</span>
                </Button>
              </RoleGuard>
            </div>

            <Card className="shadow-none overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs">
                    <TableHead>User</TableHead>
                    <TableHead>Assigned Dynamic Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersList.map((u) => {
                    const isPrimaryAdmin = u.email === "admin@myorganisation.com";
                    return (
                      <TableRow key={u.id} className="text-xs">
                        <TableCell className="font-medium">
                          <div>
                            <span className="font-semibold text-foreground block">{u.name}</span>
                            <span className="text-[10px] text-muted-foreground">{u.email}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          {isPrimaryAdmin ? (
                            <Badge variant="secondary" className="text-[10px] bg-copper/10 text-copper border-copper/30 gap-1">
                              <Lock className="size-2.5" />
                              <span>System Administrator (Read-Only)</span>
                            </Badge>
                          ) : (
                            <RoleGuard
                              permission="canAssignRoles"
                              fallback={
                                <Badge variant="outline" className="text-[10px]">
                                  {rolesList.find((r) => r.slug === u.role)?.name || u.role}
                                </Badge>
                              }
                            >
                              <select
                                value={u.role}
                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                className="h-7 text-xs rounded-xs border border-border bg-card px-2 text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-copper"
                              >
                                {rolesList.map((r) => (
                                  <option key={r.id} value={r.slug}>
                                    {r.name} {r.slug === "system_admin" ? "(Root Admin)" : r.isSystem ? "(System)" : "(Custom)"}
                                  </option>
                                ))}
                              </select>
                            </RoleGuard>
                          )}
                        </TableCell>

                        <TableCell>
                          <span className="text-muted-foreground text-xs">
                            {u.departmentName || "General Operations"}
                          </span>
                        </TableCell>

                        <TableCell>
                          {u.isActive ? (
                            <Badge variant="soft-success" className="text-[10px]">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground">
                              Deactivated
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </TableCell>

                        <TableCell className="text-right">
                          {!isPrimaryAdmin && (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => handleToggleUserActive(u.id, u.isActive)}
                                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                              >
                                {u.isActive ? "Deactivate" : "Activate"}
                              </Button>
                              <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                className="h-7 w-7 p-0 text-destructive/70 hover:text-destructive"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        )}

        {/* 4. DEPARTMENTS */}
        {canViewDepts && (
          <TabsContent value="departments" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Define functional departments for requisitions and workforce allocation.
              </div>
              <RoleGuard permission="canManageDepartments">
                <Button
                  size="sm"
                  variant="accent"
                  onClick={() => setDeptModalOpen(true)}
                  className="gap-1 text-xs"
                >
                  <Plus className="size-3.5" />
                  <span>Add Department</span>
                </Button>
              </RoleGuard>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {departments.map((dept) => (
                <Card key={dept.id} className="shadow-none border border-border p-3 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-foreground text-xs block">{dept.name}</span>
                    <Badge variant="outline" className="text-[10px] mt-0.5">
                      Code: {dept.code}
                    </Badge>
                  </div>
                  <RoleGuard permission="canManageDepartments">
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleDeleteDept(dept.id, dept.name)}
                      className="h-7 w-7 p-0 text-destructive/70 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </RoleGuard>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}

        {/* 5. LOCATIONS */}
        {canViewLocations && (
          <TabsContent value="locations" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Configure global office locations and hiring hubs.
              </div>
              <RoleGuard permission="canManageSettings">
                <Button
                  size="sm"
                  variant="accent"
                  onClick={() => setLocModalOpen(true)}
                  className="gap-1 text-xs"
                >
                  <Plus className="size-3.5" />
                  <span>Add Office Hub</span>
                </Button>
              </RoleGuard>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {locations.map((loc) => (
                <Card key={loc.id} className="shadow-none border border-border p-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1 font-semibold text-foreground text-xs">
                      <MapPin className="size-3 text-copper" />
                      <span>{loc.name}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground block mt-0.5">
                      {loc.city}, {loc.country}
                    </span>
                  </div>
                  <RoleGuard permission="canManageSettings">
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleDeleteLoc(loc.id, loc.name)}
                      className="h-7 w-7 p-0 text-destructive/70 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </RoleGuard>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}

        {/* 6. INTEGRATIONS / MICROFRONTEND */}
        {canViewSDK && (
          <TabsContent value="integrations" className="space-y-4">
            <Card className="shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold">Microfrontend Architecture SDK</CardTitle>
                    <CardDescription className="text-xs">
                      Embed RecruitBook ATS modules directly inside My Organisation HRM
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={copyToClipboard}
                    className="gap-1 text-xs"
                  >
                    {copied ? <CheckCircle2 className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
                    <span>{copied ? "Copied" : "Copy Code"}</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="p-3 bg-muted/60 rounded-xs border border-border text-[11px] text-foreground overflow-x-auto">
                  {embedCodeSnippet}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* CREATE CUSTOM ROLE MODAL */}
      <Dialog open={createRoleModalOpen} onOpenChange={setCreateRoleModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <ShieldCheck className="size-4 text-copper" />
              <span>Create Custom Dynamic Role</span>
            </DialogTitle>
            <div className="text-xs text-muted-foreground">
              Define a new role and choose granular system permissions.
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="field-label">Role Title *</label>
                <Input
                  value={roleName}
                  onChange={(e) => {
                    setRoleName(e.target.value);
                    if (!roleSlug) {
                      setRoleSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "_")
                          .replace(/^_+|_+$/g, ""),
                      );
                    }
                  }}
                  placeholder="e.g. Lead Technical Recruiter"
                  className="h-8 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="field-label">Role Identifier Slug</label>
                <Input
                  value={roleSlug}
                  onChange={(e) => setRoleSlug(e.target.value)}
                  placeholder="e.g. lead_tech_recruiter"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="field-label">Role Description</label>
                <Textarea
                  rows={2}
                  value={roleDesc}
                  onChange={(e) => setRoleDesc(e.target.value)}
                  placeholder="Responsibilities and access scope for this role..."
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="field-label">Badge Label</label>
                <Input
                  value={roleBadge}
                  onChange={(e) => setRoleBadge(e.target.value)}
                  placeholder="e.g. Recruiter Lead"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Permissions Checkbox Matrix Grouped by Category */}
            <div className="space-y-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-foreground">
                  Grant System Permissions ({rolePerms.size} selected)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    onClick={() => setRolePerms(new Set(ALL_PERMISSIONS.map((p) => p.key)))}
                    className="h-6 text-[11px] text-copper"
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    onClick={() => setRolePerms(new Set())}
                    className="h-6 text-[11px] text-muted-foreground"
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {PERMISSION_CATEGORIES.map((cat) => {
                  const catPerms = ALL_PERMISSIONS.filter((p) => p.category === cat.id);
                  return (
                    <div key={cat.id} className="p-3 bg-muted/30 rounded-xs border border-border space-y-2">
                      <div className="font-semibold text-[11px] text-foreground uppercase tracking-wider text-copper">
                        {cat.name}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {catPerms.map((p) => {
                          const checked = rolePerms.has(p.key);
                          return (
                            <label
                              key={p.key}
                              className="flex items-start gap-2 p-1.5 rounded-xs hover:bg-muted/50 cursor-pointer text-xs"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  const next = new Set(rolePerms);
                                  if (e.target.checked) next.add(p.key);
                                  else next.delete(p.key);
                                  setRolePerms(next);
                                }}
                                className="mt-0.5 size-3.5 rounded-xs accent-copper cursor-pointer"
                              />
                              <div>
                                <span className="font-medium text-foreground block text-[11px] leading-tight">
                                  {p.label}
                                </span>
                                <span className="text-[10px] text-muted-foreground leading-tight block">
                                  {p.description}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button size="xs" variant="outline" onClick={() => setCreateRoleModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="xs"
              variant="accent"
              disabled={isCreatingRole}
              onClick={handleCreateRole}
              className="gap-1"
            >
              {isCreatingRole ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" />}
              <span>Save &amp; Create Role</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT ROLE & PERMISSIONS MODAL */}
      <Dialog open={!!editingRole} onOpenChange={(open) => !open && setEditingRole(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <Edit2 className="size-4 text-copper" />
              <span>Edit Role &amp; Permissions: {editingRole?.name}</span>
            </DialogTitle>
            <div className="text-xs text-muted-foreground">
              Update role attributes and toggle active permissions in database.
            </div>
          </DialogHeader>

          {editingRole && (
            <div className="space-y-4 py-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="field-label">Role Title</label>
                  <Input
                    value={editRoleName}
                    onChange={(e) => setEditRoleName(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="field-label">Badge Label</label>
                  <Input
                    value={editRoleBadge}
                    onChange={(e) => setEditRoleBadge(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="field-label">Role Description</label>
                  <Textarea
                    rows={2}
                    value={editRoleDesc}
                    onChange={(e) => setEditRoleDesc(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Permissions Checkbox Matrix */}
              <div className="space-y-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-foreground">
                    Assigned Permissions ({editRolePerms.size} selected)
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="xs"
                      variant="ghost"
                      onClick={() => setEditRolePerms(new Set(ALL_PERMISSIONS.map((p) => p.key)))}
                      className="h-6 text-[11px] text-copper"
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      size="xs"
                      variant="ghost"
                      onClick={() => setEditRolePerms(new Set())}
                      className="h-6 text-[11px] text-muted-foreground"
                    >
                      Clear All
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {PERMISSION_CATEGORIES.map((cat) => {
                    const catPerms = ALL_PERMISSIONS.filter((p) => p.category === cat.id);
                    return (
                      <div key={cat.id} className="p-3 bg-muted/30 rounded-xs border border-border space-y-2">
                        <div className="font-semibold text-[11px] text-foreground uppercase tracking-wider text-copper">
                          {cat.name}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {catPerms.map((p) => {
                            const checked = editRolePerms.has(p.key);
                            return (
                              <label
                                key={p.key}
                                className="flex items-start gap-2 p-1.5 rounded-xs hover:bg-muted/50 cursor-pointer text-xs"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => {
                                    const next = new Set(editRolePerms);
                                    if (e.target.checked) next.add(p.key);
                                    else next.delete(p.key);
                                    setEditRolePerms(next);
                                  }}
                                  className="mt-0.5 size-3.5 rounded-xs accent-copper cursor-pointer"
                                />
                                <div>
                                  <span className="font-medium text-foreground block text-[11px] leading-tight">
                                    {p.label}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground leading-tight block">
                                    {p.description}
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button size="xs" variant="outline" onClick={() => setEditingRole(null)}>
              Cancel
            </Button>
            <Button
              size="xs"
              variant="accent"
              disabled={isUpdatingRole}
              onClick={handleSaveEditRole}
              className="gap-1"
            >
              {isUpdatingRole ? <Loader2 className="size-3 animate-spin" /> : null}
              <span>Save Role Changes</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Modal */}
      <Dialog open={userModalOpen} onOpenChange={setUserModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Add New User Account</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <label className="field-label">Full Name *</label>
              <Input
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="field-label">Email Address *</label>
              <Input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="e.g. alex@example.com"
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="field-label">Temporary Password *</label>
              <Input
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="field-label">Dynamic RBAC Role *</label>
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value)}
                className="w-full h-8 px-2 text-xs rounded-xs border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-copper"
              >
                {rolesList.map((r) => (
                  <option key={r.id} value={r.slug}>
                    {r.name} {r.slug === "system_admin" ? "(Root Admin)" : r.isSystem ? "(System)" : "(Custom)"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button size="xs" variant="outline" onClick={() => setUserModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="xs"
              variant="accent"
              disabled={isCreatingUser}
              onClick={handleCreateUser}
              className="gap-1"
            >
              {isCreatingUser ? <Loader2 className="size-3 animate-spin" /> : null}
              <span>Create Account</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Department Modal */}
      <Dialog open={deptModalOpen} onOpenChange={setDeptModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Add Department</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <label className="field-label">Department Name</label>
              <Input
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                placeholder="e.g. Data Science & AI"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="field-label">Department Code</label>
              <Input
                value={newDeptCode}
                onChange={(e) => setNewDeptCode(e.target.value)}
                placeholder="e.g. DSAI"
                className="h-8 text-xs uppercase"
              />
            </div>
          </div>

          <DialogFooter>
            <Button size="xs" variant="outline" onClick={() => setDeptModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="xs"
              variant="accent"
              disabled={isCreatingDept}
              onClick={handleCreateDept}
              className="gap-1"
            >
              {isCreatingDept ? <Loader2 className="size-3 animate-spin" /> : null}
              <span>Add Department</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Location Modal */}
      <Dialog open={locModalOpen} onOpenChange={setLocModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Add Office Location</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <label className="field-label">Location Title</label>
              <Input
                value={newLocName}
                onChange={(e) => setNewLocName(e.target.value)}
                placeholder="e.g. Seattle Innovation Hub"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="field-label">City</label>
              <Input
                value={newLocCity}
                onChange={(e) => setNewLocCity(e.target.value)}
                placeholder="e.g. Seattle, WA"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="field-label">Country</label>
              <Input
                value={newLocCountry}
                onChange={(e) => setNewLocCountry(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button size="xs" variant="outline" onClick={() => setLocModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="xs"
              variant="accent"
              disabled={isCreatingLoc}
              onClick={handleCreateLoc}
              className="gap-1"
            >
              {isCreatingLoc ? <Loader2 className="size-3 animate-spin" /> : null}
              <span>Add Location</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="page p-8 text-xs text-muted-foreground">Loading settings...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
