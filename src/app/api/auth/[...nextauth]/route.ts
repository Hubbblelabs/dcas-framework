import NextAuth from "next-auth";
import { buildAuthOptions } from "@/lib/auth";

/**
 * Route handler — rebuild options per-request so the cookie domain
 * always matches the actual incoming Host header.
 */
async function handler(
  req: Request,
  props: { params: Promise<{ nextauth: string[] }> },
) {
  const params = await props.params;
  const host = req.headers.get("host") ?? undefined;
  const options = buildAuthOptions(host);
  return NextAuth(options)(req as never, { params } as never);
}

export { handler as GET, handler as POST };
