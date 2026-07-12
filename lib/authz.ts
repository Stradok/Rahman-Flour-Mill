import { auth } from "@/auth";

/**
 * Server-side owner check for API routes that expose financial data.
 * Returns the session when the caller is an owner, otherwise null.
 */
export async function requireOwner() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "owner") {
    return null;
  }
  return session;
}
