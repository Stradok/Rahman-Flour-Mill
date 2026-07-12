import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getDatabase, dbExists } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
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

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username?.toString().trim().toLowerCase();
        const password = credentials?.password?.toString();
        if (!username || !password) return null;

        if (!dbExists()) {
          console.error("[auth] login attempted before setup — no database file");
          return null;
        }

        try {
          const db = getDatabase();
          const result = db
            .select()
            .from(users)
            .where(eq(users.username, username))
            .limit(1)
            .all();

          const user = result[0];
          if (!user) return null;
          if (!verifyPassword(password, user.passwordHash)) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.username,
            role: user.role,
          };
        } catch (err) {
          console.error("[auth] database error during login:", err);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutes
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
