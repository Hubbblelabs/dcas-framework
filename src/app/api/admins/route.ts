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
    if (
      !session ||
      !session.user?.role ||
      !["admin", "superadmin"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectToDatabase();

    const query: any = {};
    if (session.user.role === "admin") {
      // Admins cannot see superadmins
      query.role = { $ne: "superadmin" };
    }

    const admins = await Admin.find(query)
      .select("-password")
      .sort({ createdAt: -1 });
    return NextResponse.json({ admins });
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
    if (
      !session ||
      !session.user?.role ||
      !["admin", "superadmin"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { email, password, name, role } = await request.json();

    if (session.user.role === "admin" && role === "superadmin") {
      return NextResponse.json(
        { error: "Admins cannot create superadmins" },
        { status: 403 },
      );
    }

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
      role: role || "admin",
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
