import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        departmentId: user.departmentId,
        avatarUrl: user.avatarUrl,
        organizationName: user.organizationName,
      },
    });
  } catch (err) {
    console.error("Auth status error:", err);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
