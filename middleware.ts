import { NextRequest, NextResponse } from "next/server";
import { verifyTokenEdge as verifyToken } from "./lib/sessionEdge";
import { COOKIE_NAME } from "./lib/session";

// ─── Routes that don't require authentication ─────────────────────────────────
const PUBLIC_PATHS = [
  "/login",
  "/api/auth/login",
];

// ─── Routes restricted to admin only ─────────────────────────────────────────
const ADMIN_ONLY_PATHS = ["/admin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static assets and Next.js internals through immediately
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/"  // root handled below after token check
  ) {
    // Still check token for root
    if (pathname !== "/") return NextResponse.next();
  }

  // Allow public paths without a token
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (isPublic) {
    // If already logged in and hitting /login, redirect to dashboard
    if (pathname === "/login") {
      const token = req.cookies.get(COOKIE_NAME)?.value;
      if (token) {
        const session = await verifyToken(token);
        if (session) {
          return NextResponse.redirect(new URL("/", req.url));
        }
      }
    }
    return NextResponse.next();
  }

  // ─── Verify JWT ─────────────────────────────────────────────────────────────
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const session = await verifyToken(token);
  if (!session) {
    // Expired or invalid token — clear it and redirect
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("returnUrl", pathname);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
    return res;
  }

  // ─── RBAC: admin-only routes ─────────────────────────────────────────────
  const isAdminOnly = ADMIN_ONLY_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (isAdminOnly && session.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ─── Attach session info to request headers for Server Components ─────────
  const res = NextResponse.next();
  res.headers.set("x-user-id",   session.sub);
  res.headers.set("x-user-role", session.role);
  return res;
}

export const config = {
  // Run on all routes except static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
