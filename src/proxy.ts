// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";

  /**
   * Expected patterns:
   * admin.tenant.site.com
   * tenant.site.com
   */

  const hostParts = host.split(".");

  const isLocalhost = host.includes("localhost");

  let isAdminSubdomain = false;
  let tenant: string | null = null;

  if (isLocalhost) {
    // admin.tenant.localhost:3000
    const localParts = host.split(".");
    if (localParts[0] === "admin") {
      isAdminSubdomain = true;
      tenant = localParts[1];
    }
  } else {
    // admin.tenant.site.com
    if (hostParts.length >= 4 && hostParts[0] === "admin") {
      isAdminSubdomain = true;
      tenant = hostParts[1];
    }
  }

  // ---------------------------------------------------
  // BLOCK /admin from non-admin subdomains
  // ---------------------------------------------------
  if (pathname.startsWith("/admin") && !isAdminSubdomain) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // ---------------------------------------------------
  // Rewrite admin subdomain → /admin
  // ---------------------------------------------------
  if (isAdminSubdomain && !pathname.startsWith("/admin")) {
    const url = request.nextUrl.clone();
    url.pathname = `/admin${pathname}`;
    url.searchParams.set("tenant", tenant || "");
    return NextResponse.rewrite(url);
  }

  // ---------------------------------------------------
  // Protect admin routes
  // ---------------------------------------------------
  if (isAdminSubdomain && !pathname.startsWith("/admin/login")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
