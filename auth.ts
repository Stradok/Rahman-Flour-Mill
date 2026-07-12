import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { scryptSync, timingSafeEqual } from "crypto";
import { getDatabase, unlockWithStoredPassword } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      id?: string;
      role?: string;
    } & DefaultSession["user"];
  }
}

function verifyPassword(password: string, hash: string): boolean {
  try {
    const storedHash = Buffer.from(hash, 'hex');
    const inputHash = scryptSync(password, "salt", 32);
    return timingSafeEqual(storedHash, inputHash);
  } catch {
    return false;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          // Unlock database with stored password
          unlockWithStoredPassword();
          const db = getDatabase();
          const result = db
            .select()
            .from(users)
            .where(eq(users.username, credentials.username as string))
            .limit(1)
            .all();

          const user = result[0];

          if (!user) {
            return null;
          }

          if (!verifyPassword(credentials.password as string, user.passwordHash)) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.username,
            role: user.role,
          };
        } catch (err) {
          console.error("Auth error:", err);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutes (in seconds)
    updateAge: 5 * 60, // refresh token after 5 minutes of activity
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id as string,
        role: token.role as string,
      };
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
