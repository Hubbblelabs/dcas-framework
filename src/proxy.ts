// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";

  const isAdminSubdomain =
    host.startsWith("admin.") ||
    host.startsWith("admin.localhost"); // for local dev

  // -----------------------------
  // Rewrite admin subdomain
  // -----------------------------
  if (isAdminSubdomain && !pathname.startsWith("/admin")) {
    const url = request.nextUrl.clone();
    url.pathname = `/admin${pathname}`;
    return NextResponse.rewrite(url);
  }

  // -----------------------------
  //  Protect admin routes
  // -----------------------------
  if (
    (isAdminSubdomain || pathname.startsWith("/admin")) &&
    !pathname.startsWith("/admin/login")
  ) {
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
  matcher: [
    /*
     Match all routes except:
     - _next (static files)
     - api (next-auth api)
     - favicon
    */
    "/((?!_next|api|favicon.ico).*)",
  ],
};
