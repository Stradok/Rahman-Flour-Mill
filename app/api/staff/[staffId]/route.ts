import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDatabase, unlockWithStoredPassword } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/password";

// DELETE: Remove staff member (owner only)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ staffId: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { staffId } = await params;

    // Prevent deleting yourself
    if (staffId === (session.user as any).id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    unlockWithStoredPassword();
    const db = getDatabase();

    // Verify staff member exists and is staff role
    const staff = await db
      .select()
      .from(users)
      .where(eq(users.id, staffId))
      .limit(1)
      .then((res) => res[0]);

    if (!staff) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    if (staff.role !== "staff") {
      return NextResponse.json(
        { error: "Can only delete staff members" },
        { status: 400 }
      );
    }

    await db.delete(users).where(eq(users.id, staffId));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/staff error:", error);
    return NextResponse.json({ error: "Failed to delete staff" }, { status: 500 });
  }
}

// PATCH: Update staff member password (owner only)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ staffId: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { staffId } = await params;
    const { newPassword } = await req.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    unlockWithStoredPassword();
    const db = getDatabase();

    // Verify staff member exists
    const staff = await db
      .select()
      .from(users)
      .where(eq(users.id, staffId))
      .limit(1)
      .then((res) => res[0]);

    if (!staff) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    if (staff.role !== "staff") {
      return NextResponse.json(
        { error: "Can only reset staff passwords" },
        { status: 400 }
      );
    }

    // Update password
    const passwordHash = hashPassword(newPassword);
    await db.update(users).set({ passwordHash }).where(eq(users.id, staffId));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PATCH /api/staff error:", error);
    return NextResponse.json(
      { error: "Failed to update staff" },
      { status: 500 }
    );
  }
}
