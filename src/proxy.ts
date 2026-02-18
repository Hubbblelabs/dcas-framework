import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Next.js 16+ proxy convention (replaces middleware.ts).
 * File: src/proxy.ts  |  Export: proxy (default or named)
 *
 * Subdomain routing:
 *   Production:  admin.dcas.teammistake.com → rewrites to /admin/*
 *   Localhost:   admin.dcas.localhost:3000  → rewrites to /admin/*
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";

  // ─── Detect admin subdomain ────────────────────────────────────────────────

  const isLocalhost =
    host.includes("localhost") || host.includes("127.0.0.1");

  let isAdminSubdomain = false;
  let tenant: string | null = null;

  if (isLocalhost) {
    // Strip port first: "admin.dcas.localhost:3000" → "admin.dcas.localhost"
    const hostWithoutPort = host.split(":")[0];
    const parts = hostWithoutPort.split(".");
    // Expect: ["admin", "dcas", "localhost"]
    if (parts[0] === "admin") {
      isAdminSubdomain = true;
      tenant = parts[1] ?? null;
    }
  } else {
    // Production: "admin.dcas.teammistake.com" → ["admin", "dcas", "teammistake", "com"]
    const parts = host.split(".");
    if (parts.length >= 3 && parts[0] === "admin") {
      isAdminSubdomain = true;
      tenant = parts[1] ?? null;
    }
  }

  // ─── Always pass NextAuth API routes through untouched ────────────────────
  //
  // NextAuth's route handler lives at /api/auth/[...nextauth].
  // If we rewrite the path (e.g. prepend /admin) the handler won't be found
  // and NextAuth will reject the callback with 401.
  // We let these requests hit the app as-is; NextAuth resolves the correct
  // URL from the Host header at runtime.
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // ─── Block direct /admin access from non-admin subdomains ─────────────────
  if (pathname.startsWith("/admin") && !isAdminSubdomain) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // ─── Rewrite admin subdomain → /admin/* ───────────────────────────────────
  //
  // admin.dcas.teammistake.com/dashboard  →  internal: /admin/dashboard
  // admin.dcas.teammistake.com/login      →  internal: /admin/login
  if (isAdminSubdomain && !pathname.startsWith("/admin") && !pathname.startsWith("/api")) {
    const url = request.nextUrl.clone();
    url.pathname = `/admin${pathname}`;
    if (tenant) {
      url.searchParams.set("tenant", tenant);
    }
    return NextResponse.rewrite(url);
  }

  // ─── Protect admin routes — redirect to login if no valid JWT ─────────────
  //
  // Skip: /admin/login (avoid redirect loop)
  //       /api/*       (API routes handle their own auth)
  if (
    isAdminSubdomain &&
    !pathname.startsWith("/admin/login") &&
    !pathname.startsWith("/api/")
  ) {
    const isProduction = process.env.NODE_ENV === "production";
    // Must match the cookie name set in route.ts
    const cookieName = isProduction
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token";

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName,
    });

    if (!token) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.search = "";
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Run on all paths EXCEPT static assets and uploads.
   * /api is intentionally NOT excluded — we need to intercept /api/auth/*
   * and pass it through (see early-return above), while still being able
   * to block /api routes on wrong subdomains if needed in future.
   */
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads).*)"],
};
