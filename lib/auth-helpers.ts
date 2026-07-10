import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function requireOwner() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  return null;
}

export async function getSession() {
  return auth();
}
