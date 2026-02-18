import NextAuth, { NextAuthOptions, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import Admin from "@/lib/models/Admin";

if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("NEXTAUTH_SECRET is not set");
}

/**
 * Derive the root domain for cookie sharing across subdomains.
 *
 * Examples:
 *   admin.dcas.teammistake.com  → .teammistake.com
 *   admin.dcas.localhost:3000   → undefined  (localhost cookies don't need a domain)
 *   localhost:3000              → undefined
 */
function getRootDomain(host: string): string | undefined {
  const hostWithoutPort = host.split(":")[0];
  if (
    hostWithoutPort === "localhost" ||
    hostWithoutPort === "127.0.0.1" ||
    hostWithoutPort.endsWith(".localhost")
  ) {
    return undefined;
  }
  // Return the top two labels as the root domain (e.g. "teammistake.com")
  const parts = hostWithoutPort.split(".");
  if (parts.length >= 2) {
    return `.${parts.slice(-2).join(".")}`;
  }
  return undefined;
}

/**
 * Build NextAuth options. We accept the incoming Host header so we can
 * set the correct cookie domain and NEXTAUTH_URL for subdomain routing.
 */
function buildAuthOptions(host?: string): NextAuthOptions {
  const isProduction = process.env.NODE_ENV === "production";
  const cookieDomain = host ? getRootDomain(host) : undefined;

  return {
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) return null;
          try {
            await connectToDatabase();
            const admin = await Admin.findOne({
              email: credentials.email.toLowerCase(),
            });
            if (!admin) return null;
            const isValid = await bcrypt.compare(
              credentials.password as string,
              admin.password,
            );
            if (isValid) {
              return {
                id: admin._id.toString(),
                email: admin.email,
                name: admin.name,
                role: admin.role,
              };
            }
            return null;
          } catch (error) {
            console.error("Authorization error:", error);
            return null;
          }
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }: { token: JWT; user?: User }) {
        if (user) {
          token.id = user.id;
          token.role = user.role;
        }
        return token;
      },
      async session({ session, token }: { session: Session; token: JWT }) {
        if (session.user) {
          session.user.id = token.id;
          session.user.role = token.role;
        }
        return session;
      },
    },
    pages: {
      signIn: "/admin/login",
    },
    session: {
      strategy: "jwt",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    cookies: {
      sessionToken: {
        // Use the __Secure- prefix in production (requires HTTPS)
        name: isProduction
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
        options: {
          httpOnly: true,
          sameSite: "lax" as const,
          path: "/",
          secure: isProduction,
          // Share the cookie across all subdomains in production
          ...(cookieDomain ? { domain: cookieDomain } : {}),
        },
      },
    },
    secret: process.env.NEXTAUTH_SECRET,
  };
}

// Export a static authOptions for use in getServerSession() calls elsewhere
export const authOptions: NextAuthOptions = buildAuthOptions(
  process.env.NEXTAUTH_URL
    ? new URL(process.env.NEXTAUTH_URL).host
    : undefined,
);

/**
 * Route handler — rebuild options per-request so the cookie domain
 * always matches the actual incoming Host header.
 */
async function handler(
  req: Request,
  context: { params: { nextauth: string[] } },
) {
  const host = req.headers.get("host") ?? undefined;
  const options = buildAuthOptions(host);
  return NextAuth(options)(req as never, context as never);
}

export { handler as GET, handler as POST };
