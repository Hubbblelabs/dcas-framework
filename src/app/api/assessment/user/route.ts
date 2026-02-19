import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/lib/models/User";

export async function POST(req: Request) {
  try {
    const { name, email, phone, batch, institution } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectToDatabase();

    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // Security fix: Do not update existing users to prevent unauthorized changes/impersonation.
      // We simply return the existing user's ID.
      // If a student needs to update details, they should contact admin or we need a proper auth flow.
    } else {
      // Create new user
      if (!name) {
        return NextResponse.json(
          { error: "Name is required for new users" },
          { status: 400 },
        );
      }
      user = await User.create({
        name,
        email,
        phone,
        institution: institution || undefined,
        role: "student",
        meta: {
          batch: batch || undefined,
          institution: institution || undefined,
        },
      });
    }

    return NextResponse.json({
      userId: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      institution: user.institution,
    });
  } catch (error) {
    console.error("User auth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
