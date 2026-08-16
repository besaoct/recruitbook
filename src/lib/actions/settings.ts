"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  organizations,
  departments,
  locations,
  workModes,
  employmentTypes,
  experienceLevels,
  educationLevels,
  users,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { assertPermission, type UserRole } from "@/lib/auth/rbac";
import { hashPassword } from "@/lib/auth/password";

export async function getOrganizationSettings() {
  try {
    const org = await db.select().from(organizations).limit(1);
    return (
      org[0] || {
        id: "org_myorganisation",
        name: "My Organisation",
        slug: "my-organisation",
        careersDomain: "careers.myorganisation.com",
        defaultCurrency: "USD",
        timezone: "UTC",
        hrmWebhookUrl: "https://hrm.myorganisation.com/api/v1/recruitment-webhook",
      }
    );
  } catch (error) {
    console.error("Failed to fetch organization:", error);
    return null;
  }
}

export async function updateOrganizationSettings(data: {
  name?: string;
  careersDomain?: string;
  defaultCurrency?: string;
  timezone?: string;
  hrmWebhookUrl?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthenticated");
  assertPermission(user.role, "canManageSettings", user.permissions);

  await db
    .update(organizations)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(organizations.slug, "my-organisation"));

  revalidatePath("/settings");
  revalidatePath("/(app)", "layout");
  return { success: true };
}

export async function getUsers() {
  try {
    return await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        departmentId: users.departmentId,
        departmentName: departments.name,
        isActive: users.isActive,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .leftJoin(departments, eq(users.departmentId, departments.id))
      .orderBy(desc(users.createdAt));
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

export async function createUser(data: {
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  password?: string;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthenticated");
  assertPermission(currentUser.role, "canManageUsers", currentUser.permissions);

  const passwordHash = await hashPassword(data.password || "ReqruitBook2026!");
  const newId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  await db.insert(users).values({
    id: newId,
    orgId: "org_myorganisation",
    name: data.name,
    email: data.email.toLowerCase().trim(),
    passwordHash,
    role: data.role,
    departmentId: data.departmentId || null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath("/settings");
  return { success: true, id: newId };
}

export async function updateUserRole(userId: string, newRole: UserRole) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthenticated");
  assertPermission(currentUser.role, "canAssignRoles", currentUser.permissions);

  // Prevent modifying the role of the primary System Administrator
  const targetUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (targetUser[0]?.email === "admin@myorganisation.com" && newRole !== "system_admin") {
    throw new Error("Cannot demote the primary System Administrator root account.");
  }

  await db
    .update(users)
    .set({
      role: newRole,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  revalidatePath("/settings");
  return { success: true, userId, newRole };
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthenticated");
  assertPermission(currentUser.role, "canManageUsers", currentUser.permissions);

  // Prevent deactivating oneself
  if (currentUser.id === userId) {
    throw new Error("Cannot deactivate your own active account.");
  }

  await db
    .update(users)
    .set({
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  revalidatePath("/settings");
  return { success: true, isActive };
}

export async function deleteUser(userId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthenticated");
  assertPermission(currentUser.role, "canManageUsers", currentUser.permissions);

  // Prevent deleting oneself or root admin
  if (currentUser.id === userId) {
    throw new Error("Cannot delete your own active account.");
  }

  const target = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (target[0]?.email === "admin@myorganisation.com") {
    throw new Error("Cannot delete the root System Administrator account.");
  }

  await db.delete(users).where(eq(users.id, userId));

  revalidatePath("/settings");
  return { success: true };
}

export async function getDepartments() {
  try {
    return await db.select().from(departments).orderBy(departments.name);
  } catch (error) {
    console.error("Failed to fetch departments:", error);
    return [];
  }
}

export async function createDepartment(data: {
  name: string;
  code: string;
  leadName?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthenticated");
  assertPermission(user.role, "canManageDepartments", user.permissions);

  const newId = `dept_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  await db.insert(departments).values({
    id: newId,
    orgId: "org_myorganisation",
    name: data.name,
    code: data.code.toUpperCase(),
    leadName: data.leadName || "Department Head",
    createdAt: new Date(),
  });

  revalidatePath("/settings");
  revalidatePath("/jobs");
  return { success: true, id: newId };
}

export async function updateDepartment(
  id: string,
  data: { name?: string; code?: string; leadName?: string }
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthenticated");
  assertPermission(user.role, "canManageDepartments", user.permissions);

  await db
    .update(departments)
    .set({
      ...(data.name && { name: data.name }),
      ...(data.code && { code: data.code.toUpperCase() }),
      ...(data.leadName !== undefined && { leadName: data.leadName }),
    })
    .where(eq(departments.id, id));

  revalidatePath("/settings");
  revalidatePath("/jobs");
  return { success: true };
}

export async function deleteDepartment(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthenticated");
  assertPermission(user.role, "canManageDepartments", user.permissions);

  await db.delete(departments).where(eq(departments.id, id));

  revalidatePath("/settings");
  return { success: true };
}

export async function getLocations() {
  try {
    return await db.select().from(locations).orderBy(locations.name);
  } catch (error) {
    console.error("Failed to fetch locations:", error);
    return [];
  }
}

export async function createLocation(data: {
  name: string;
  city: string;
  country: string;
  isRemoteHub?: boolean;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthenticated");
  assertPermission(user.role, "canManageLocations", user.permissions);

  const newId = `loc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  await db.insert(locations).values({
    id: newId,
    orgId: "org_myorganisation",
    name: data.name,
    city: data.city,
    country: data.country,
    isRemoteHub: data.isRemoteHub || false,
    createdAt: new Date(),
  });

  revalidatePath("/settings");
  revalidatePath("/jobs");
  return { success: true, id: newId };
}

export async function updateLocation(
  id: string,
  data: { name?: string; city?: string; country?: string; isRemoteHub?: boolean }
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthenticated");
  assertPermission(user.role, "canManageLocations", user.permissions);

  await db
    .update(locations)
    .set({
      ...(data.name && { name: data.name }),
      ...(data.city && { city: data.city }),
      ...(data.country && { country: data.country }),
      ...(data.isRemoteHub !== undefined && { isRemoteHub: data.isRemoteHub }),
    })
    .where(eq(locations.id, id));

  revalidatePath("/settings");
  revalidatePath("/jobs");
  return { success: true };
}

export async function deleteLocation(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthenticated");
  assertPermission(user.role, "canManageLocations", user.permissions);

  await db.delete(locations).where(eq(locations.id, id));

  revalidatePath("/settings");
  return { success: true };
}

/* -------------------------------------------------------------------------- */
/* WORK MODES                                                                 */
/* -------------------------------------------------------------------------- */

export async function getWorkModes() {
  try {
    return await db.select().from(workModes).orderBy(workModes.name);
  } catch (error) {
    console.error("Failed to fetch work modes:", error);
    return [];
  }
}

export async function createWorkMode(data: {
  name: string;
  slug?: string;
  description?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthenticated");
  assertPermission(user.role, "canManageWorkModes", user.permissions);

  const slug = (data.slug || data.name).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const newId = `wm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  await db.insert(workModes).values({
    id: newId,
    orgId: "org_myorganisation",
    name: data.name,
    slug: slug || `wm_${Date.now()}`,
    description: data.description || null,
    isDefault: false,
    createdAt: new Date(),
  });

  revalidatePath("/settings");
  revalidatePath("/jobs");
  return { success: true, id: newId };
}

export async function updateWorkMode(
  id: string,
  data: { name?: string; slug?: string; description?: string }
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthenticated");
  assertPermission(user.role, "canManageWorkModes", user.permissions);

  await db
    .update(workModes)
    .set({
      ...(data.name && { name: data.name }),
      ...(data.slug && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description }),
    })
    .where(eq(workModes.id, id));

  revalidatePath("/settings");
  revalidatePath("/jobs");
  return { success: true };
}

export async function deleteWorkMode(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthenticated");
  assertPermission(user.role, "canManageWorkModes", user.permissions);

  await db.delete(workModes).where(eq(workModes.id, id));

  revalidatePath("/settings");
  revalidatePath("/jobs");
  return { success: true };
}

/* -------------------------------------------------------------------------- */
/* EMPLOYMENT TYPES                                                           */
/* -------------------------------------------------------------------------- */

export async function getEmploymentTypes() {
  try {
    return await db.select().from(employmentTypes).orderBy(employmentTypes.name);
  } catch (error) {
    console.error("Failed to fetch employment types:", error);
    return [];
  }
}

export async function createEmploymentType(data: {
  name: string;
  slug?: string;
  description?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthenticated");
  assertPermission(user.role, "canManageEmploymentTypes", user.permissions);

  const slug = (data.slug || data.name).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const newId = `et_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  await db.insert(employmentTypes).values({
    id: newId,
    orgId: "org_myorganisation",
    name: data.name,
    slug: slug || `et_${Date.now()}`,
    description: data.description || null,
    isDefault: false,
    createdAt: new Date(),
  });

  revalidatePath("/settings");
  revalidatePath("/jobs");
  return { success: true, id: newId };
}

export async function updateEmploymentType(
  id: string,
  data: { name?: string; slug?: string; description?: string }
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthenticated");
  assertPermission(user.role, "canManageEmploymentTypes", user.permissions);

  await db
    .update(employmentTypes)
    .set({
      ...(data.name && { name: data.name }),
      ...(data.slug && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description }),
    })
    .where(eq(employmentTypes.id, id));

  revalidatePath("/settings");
  revalidatePath("/jobs");
  return { success: true };
}

export async function deleteEmploymentType(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthenticated");
  assertPermission(user.role, "canManageEmploymentTypes", user.permissions);

  await db.delete(employmentTypes).where(eq(employmentTypes.id, id));

  revalidatePath("/settings");
  revalidatePath("/jobs");
  return { success: true };
}

/* -------------------------------------------------------------------------- */
/* EXPERIENCE LEVELS                                                          */
/* -------------------------------------------------------------------------- */

export async function getExperienceLevels() {
  try {
    return await db.select().from(experienceLevels).orderBy(experienceLevels.minYears);
  } catch (error) {
    console.error("Failed to fetch experience levels:", error);
    return [];
  }
}

export async function createExperienceLevel(data: {
  name: string;
  slug?: string;
  minYears?: number;
  maxYears?: number;
  description?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthenticated");
  assertPermission(user.role, "canManageExperienceLevels", user.permissions);

  const slug = (data.slug || data.name).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const newId = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  await db.insert(experienceLevels).values({
    id: newId,
    orgId: "org_myorganisation",
    name: data.name,
    slug: slug || `exp_${Date.now()}`,
    minYears: data.minYears ?? 0,
    maxYears: data.maxYears ?? 0,
    description: data.description || null,
    isDefault: false,
    createdAt: new Date(),
  });

  revalidatePath("/settings");
  revalidatePath("/jobs");
  return { success: true, id: newId };
}

export async function updateExperienceLevel(
  id: string,
  data: { name?: string; slug?: string; minYears?: number; maxYears?: number; description?: string }
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthenticated");
  assertPermission(user.role, "canManageExperienceLevels", user.permissions);

  await db
    .update(experienceLevels)
    .set({
      ...(data.name && { name: data.name }),
      ...(data.slug && { slug: data.slug }),
      ...(data.minYears !== undefined && { minYears: data.minYears }),
      ...(data.maxYears !== undefined && { maxYears: data.maxYears }),
      ...(data.description !== undefined && { description: data.description }),
    })
    .where(eq(experienceLevels.id, id));

  revalidatePath("/settings");
  revalidatePath("/jobs");
  return { success: true };
}

export async function deleteExperienceLevel(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthenticated");
  assertPermission(user.role, "canManageExperienceLevels", user.permissions);

  await db.delete(experienceLevels).where(eq(experienceLevels.id, id));

  revalidatePath("/settings");
  revalidatePath("/jobs");
  return { success: true };
}

/* -------------------------------------------------------------------------- */
/* EDUCATION LEVELS                                                           */
/* -------------------------------------------------------------------------- */

export async function getEducationLevels() {
  try {
    return await db.select().from(educationLevels).orderBy(educationLevels.name);
  } catch (error) {
    console.error("Failed to fetch education levels:", error);
    return [];
  }
}

export async function createEducationLevel(data: {
  name: string;
  slug?: string;
  description?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthenticated");
  assertPermission(user.role, "canManageEducationLevels", user.permissions);

  const slug = (data.slug || data.name).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const newId = `edu_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  await db.insert(educationLevels).values({
    id: newId,
    orgId: "org_myorganisation",
    name: data.name,
    slug: slug || `edu_${Date.now()}`,
    description: data.description || null,
    isDefault: false,
    createdAt: new Date(),
  });

  revalidatePath("/settings");
  revalidatePath("/jobs");
  return { success: true, id: newId };
}

export async function updateEducationLevel(
  id: string,
  data: { name?: string; slug?: string; description?: string }
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthenticated");
  assertPermission(user.role, "canManageEducationLevels", user.permissions);

  await db
    .update(educationLevels)
    .set({
      ...(data.name && { name: data.name }),
      ...(data.slug && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description }),
    })
    .where(eq(educationLevels.id, id));

  revalidatePath("/settings");
  revalidatePath("/jobs");
  return { success: true };
}

export async function deleteEducationLevel(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthenticated");
  assertPermission(user.role, "canManageEducationLevels", user.permissions);

  await db.delete(educationLevels).where(eq(educationLevels.id, id));

  revalidatePath("/settings");
  revalidatePath("/jobs");
  return { success: true };
}


