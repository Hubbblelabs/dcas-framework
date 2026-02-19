import { NextAuthOptions, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import Admin from "@/lib/models/Admin";

if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("NEXTAUTH_SECRET is not set");
}

function getRootDomain(host: string): string | undefined {
  const hostWithoutPort = host.split(":")[0];
  if (
    hostWithoutPort === "localhost" ||
    hostWithoutPort === "127.0.0.1" ||
    hostWithoutPort.endsWith(".localhost")
  ) {
    return undefined;
  }
  const parts = hostWithoutPort.split(".");
  if (parts.length >= 2) {
    return `.${parts.slice(-2).join(".")}`;
  }
  return undefined;
}

export function buildAuthOptions(host?: string): NextAuthOptions {
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
        name: isProduction
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
        options: {
          httpOnly: true,
          sameSite: "lax" as const,
          path: "/",
          secure: isProduction,
          ...(cookieDomain ? { domain: cookieDomain } : {}),
        },
      },
    },
    secret: process.env.NEXTAUTH_SECRET,
  };
}

export const authOptions: NextAuthOptions = buildAuthOptions(
  process.env.NEXTAUTH_URL
    ? new URL(process.env.NEXTAUTH_URL).host
    : undefined,
);
