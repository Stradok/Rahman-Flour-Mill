import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDatabase, unlockWithStoredPassword } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/password";
import { randomUUID } from "crypto";

// GET: List all staff (owner only)
export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    unlockWithStoredPassword();
    const db = getDatabase();

    const staffMembers = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.role, "staff"));

    return NextResponse.json(staffMembers);
  } catch (error) {
    console.error("GET /api/staff error:", error);
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 });
  }
}

// POST: Add new staff member (owner only)
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const name = body.name as string;
    const tempPassword = body.tempPassword as string;
    // Lowercase to match the login lookup — otherwise "Noman" could never sign in as "noman"
    const username = (body.username as string | undefined)?.trim().toLowerCase();

    // Validate input
    if (!name || !username || !tempPassword) {
      return NextResponse.json(
        { error: "Name, username, and password required" },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (tempPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    unlockWithStoredPassword();
    const db = getDatabase();

    // Check if username already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1)
      .then((res) => res[0]);

    if (existing) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    // Create new staff member
    const staffId = randomUUID();
    const passwordHash = hashPassword(tempPassword);
    const now = new Date();

    await db.insert(users).values({
      id: staffId,
      name: name.trim(),
      username,
      passwordHash,
      role: "staff",
      createdAt: now,
    });

    return NextResponse.json(
      {
        id: staffId,
        name: name.trim(),
        username,
        role: "staff",
        createdAt: now,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/staff error:", error);
    return NextResponse.json({ error: "Failed to create staff" }, { status: 500 });
  }
}
