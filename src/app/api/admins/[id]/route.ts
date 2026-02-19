import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import Admin from "@/lib/models/Admin";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      !session.user?.role ||
      !["admin", "superadmin"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    await connectToDatabase();
    const admin = await Admin.findById(id).select("-password");
    if (!admin)
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });

    if (session.user.role === "admin" && admin.role === "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ admin });
  } catch (error) {
    console.error("Error fetching admin:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      !session.user?.role ||
      !["admin", "superadmin"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { email, password, name, role } = await request.json();
    const { id } = await params;
    await connectToDatabase();
    const admin = await Admin.findById(id);
    if (!admin)
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });

    if (session.user.role === "admin") {
      if (admin.role === "superadmin") {
        return NextResponse.json(
          { error: "Unauthorized to update superadmin" },
          { status: 403 },
        );
      }
      if (role === "superadmin") {
        return NextResponse.json(
          { error: "Unauthorized to promote to superadmin" },
          { status: 403 },
        );
      }
    }

    if (email) admin.email = email.toLowerCase();
    if (name) admin.name = name;
    if (role) admin.role = role;
    if (password) admin.password = await bcrypt.hash(password, 10);
    await admin.save();
    const adminResponse = admin.toObject();
    delete adminResponse.password;
    return NextResponse.json({
      message: "Admin updated",
      admin: adminResponse,
    });
  } catch (error) {
    console.error("Error updating admin:", error);
    return NextResponse.json(
      { error: "Failed to update admin" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      !session.user?.role ||
      !["admin", "superadmin"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    await connectToDatabase();
    if (id === session.user?.id) {
      return NextResponse.json(
        { error: "Cannot delete yourself" },
        { status: 400 },
      );
    }

    const admin = await Admin.findById(id);
    if (!admin)
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });

    if (session.user.role === "admin" && admin.role === "superadmin") {
      return NextResponse.json(
        { error: "Unauthorized to delete superadmin" },
        { status: 403 },
      );
    }

    await Admin.findByIdAndDelete(id);
    return NextResponse.json({ message: "Admin deleted" });
  } catch (error) {
    console.error("Error deleting admin:", error);
    return NextResponse.json(
      { error: "Failed to delete admin" },
      { status: 500 },
    );
  }
}
