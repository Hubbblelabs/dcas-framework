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
      // Update user details if provided
      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (batch) user.meta = { ...user.meta, batch };
      if (institution) user.meta = { ...user.meta, institution };
      await user.save();
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
    });
  } catch (error) {
    console.error("User auth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
