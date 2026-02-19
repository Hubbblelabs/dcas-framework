import { encode, decode, JWT } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;

if (!secret) {
  // In production this should be a hard error, but for build time it might be missing
  if (process.env.NODE_ENV === "production") {
    console.error("NEXTAUTH_SECRET is not set");
  }
}

export async function createSessionToken(sessionId: string): Promise<string> {
  if (!secret) throw new Error("NEXTAUTH_SECRET is not set");
  const token = await encode({
    token: { sessionId } as unknown as JWT,
    secret,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
  return token;
}

export async function verifySessionToken(
  token: string,
): Promise<{ sessionId: string } | null> {
  if (!secret) return null;
  try {
    const decoded = await decode({ token, secret });
    if (!decoded || !decoded.sessionId) return null;
    return decoded as unknown as { sessionId: string };
  } catch (error) {
    console.error("Error verifying session token:", error);
    return null;
  }
}
