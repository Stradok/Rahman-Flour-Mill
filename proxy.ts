import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbExists } from "@/lib/db";
import { isOwnerOnlyPage } from "@/lib/access";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as { role?: string } | undefined)?.role;
  const pathname = req.nextUrl.pathname;
  const isLoginPage = pathname === "/login";
  const isSetupPage = pathname === "/setup";
  const isRecoverPage = pathname === "/recover";
  const isApiSetup = pathname === "/api/setup";
  const isApiRecover = pathname.startsWith("/api/recover");
  const dbInitialized = dbExists();

  if (!dbInitialized && !isSetupPage && !isApiSetup && !isRecoverPage && !isApiRecover) {
    return NextResponse.redirect(new URL("/setup", req.nextUrl));
  }

  if (dbInitialized && isSetupPage) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (
    !isLoggedIn &&
    !isLoginPage &&
    !isSetupPage &&
    !isRecoverPage &&
    !isApiSetup &&
    !isApiRecover &&
    dbInitialized
  ) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isLoggedIn && (isLoginPage || isSetupPage)) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // Staff must never reach financial pages — even by typing the URL.
  if (isLoggedIn && role !== "owner" && isOwnerOnlyPage(pathname)) {
    return NextResponse.redirect(new URL("/sales/quick-bill", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
