import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbExists } from "@/lib/db";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isLoginPage = req.nextUrl.pathname === "/login";
  const isSetupPage = req.nextUrl.pathname === "/setup";
  const isApiSetup = req.nextUrl.pathname === "/api/setup";
  const dbInitialized = dbExists();

  if (!dbInitialized && !isSetupPage && !isApiSetup) {
    return NextResponse.redirect(new URL("/setup", req.nextUrl));
  }

  if (dbInitialized && isSetupPage) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (!isLoggedIn && !isLoginPage && !isSetupPage && !isApiSetup && dbInitialized) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isLoggedIn && (isLoginPage || isSetupPage)) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
