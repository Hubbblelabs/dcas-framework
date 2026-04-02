import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import Admin from "@/lib/models/Admin";
import { buildAuthOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const host = request.headers.get("host") ?? undefined;
    const authOptions = buildAuthOptions(host);
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectToDatabase();

    const admins = await Admin.find({})
      .select("-password")
      .sort({ createdAt: -1 });
    const normalizedAdmins = admins.map((admin: any) => ({
      ...admin.toObject(),
      role: "admin",
    }));
    return NextResponse.json({ admins: normalizedAdmins });
  } catch (error) {
    console.error("Error fetching admins:", error);
    return NextResponse.json(
      { error: "Failed to fetch admins" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const host = request.headers.get("host") ?? undefined;
    const authOptions = buildAuthOptions(host);
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 },
      );
    }
    await connectToDatabase();
    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing)
      return NextResponse.json(
        { error: "Admin already exists" },
        { status: 409 },
      );
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: "admin",
    });
    await admin.save();
    const adminResponse = admin.toObject();
    delete adminResponse.password;
    return NextResponse.json(
      { message: "Admin created", admin: adminResponse },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json(
      { error: "Failed to create admin" },
      { status: 500 },
    );
  }
}
