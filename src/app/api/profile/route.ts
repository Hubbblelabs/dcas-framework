import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import Admin from "@/lib/models/Admin";
import { buildAuthOptions } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  try {
    const host = request.headers.get("host") ?? undefined;
    const authOptions = buildAuthOptions(host);
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !session.user?.id ||
      !["admin", "superadmin"].includes(session.user.role ?? "")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current and new password are required" },
        { status: 400 },
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 },
      );
    }

    await connectToDatabase();
    const admin = await Admin.findById(session.user.id);
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const isValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 },
      );
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 },
    );
  }
}
