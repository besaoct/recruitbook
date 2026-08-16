import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { users, organizations, roles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { DEFAULT_ROLE_PERMISSIONS } from "@/lib/auth/rbac";

const loginSchema = z.object({
  email: z.string().email("Please provide a valid corporate email address"),
  password: z.string().min(1, "Password is required"),
});

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = loginSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { email, password } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Look up user by email with dynamic role permissions
    const [foundUser] = await db
      .select({
        user: users,
        org: organizations,
        roleData: roles,
      })
      .from(users)
      .innerJoin(organizations, eq(users.orgId, organizations.id))
      .leftJoin(
        roles,
        and(
          eq(roles.orgId, users.orgId),
          eq(roles.slug, users.role),
        ),
      )
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    const now = new Date();

    // Check account lockout
    if (foundUser?.user.lockedUntil && foundUser.user.lockedUntil > now) {
      const remainingMinutes = Math.ceil(
        (foundUser.user.lockedUntil.getTime() - now.getTime()) / 60000,
      );
      return NextResponse.json(
        {
          error: `Account temporarily locked due to consecutive failed attempts. Please try again in ${remainingMinutes} minute(s).`,
        },
        { status: 429 },
      );
    }

    // Verify password with constant-time scrypt verification
    const isValid = await verifyPassword(
      password,
      foundUser?.user.passwordHash,
    );

    if (!foundUser || !isValid || !foundUser.user.isActive) {
      if (foundUser) {
        const nextAttempts = foundUser.user.failedLoginAttempts + 1;
        const willLock = nextAttempts >= MAX_FAILED_ATTEMPTS;

        await db
          .update(users)
          .set({
            failedLoginAttempts: nextAttempts,
            lockedUntil: willLock
              ? new Date(now.getTime() + LOCKOUT_MINUTES * 60000)
              : null,
          })
          .where(eq(users.id, foundUser.user.id));
      }

      // Generic authentication error to prevent email harvesting
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    // Reset failed login attempts on successful sign-in
    await db
      .update(users)
      .set({
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: now,
      })
      .where(eq(users.id, foundUser.user.id));

    // Extract client metadata
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || undefined;

    // Create session and set HttpOnly cookie
    await createSession(foundUser.user.id, {
      ipAddress,
      userAgent,
    });

    // Resolve dynamic permissions
    const userRole = foundUser.user.role;
    let dynamicPermissions: string[] = [];
    if (foundUser.roleData?.permissions && Array.isArray(foundUser.roleData.permissions)) {
      dynamicPermissions = foundUser.roleData.permissions as string[];
    } else if (DEFAULT_ROLE_PERMISSIONS[userRole]) {
      dynamicPermissions = DEFAULT_ROLE_PERMISSIONS[userRole] as string[];
    }
    if (userRole === "system_admin" && dynamicPermissions.length === 0) {
      dynamicPermissions = DEFAULT_ROLE_PERMISSIONS.system_admin as string[];
    }

    return NextResponse.json({
      success: true,
      user: {
        id: foundUser.user.id,
        name: foundUser.user.name,
        email: foundUser.user.email,
        role: foundUser.user.role,
        permissions: dynamicPermissions,
        departmentId: foundUser.user.departmentId,
        avatarUrl: foundUser.user.avatarUrl,
        organizationName: foundUser.org.name,
      },
    });
  } catch (err) {
    console.error("Login authentication error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during authentication." },
      { status: 500 },
    );
  }
}
