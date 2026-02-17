import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Settings, SETTINGS_KEYS } from "@/lib/models/Settings";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";

export async function GET() {
  try {
    await connectToDatabase();
    const setting = await Settings.findOne({ key: SETTINGS_KEYS.CUSTOM_LOGO });
    return NextResponse.json({ logoUrl: setting?.value || null });
  } catch (error) {
    console.error("Error fetching logo:", error);
    return NextResponse.json(
      { error: "Failed to fetch logo" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const formData = await request.formData();
    const file = formData.get("logo") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 },
      );
    }

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: PNG, JPEG, SVG, WebP" },
        { status: 400 },
      );
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum 2MB allowed." },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split(".").pop() || "png";
    const filename = `logo.${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const logoUrl = `/uploads/${filename}`;

    await Settings.findOneAndUpdate(
      { key: SETTINGS_KEYS.CUSTOM_LOGO },
      {
        key: SETTINGS_KEYS.CUSTOM_LOGO,
        value: logoUrl,
        description: "Custom logo URL",
      },
      { upsert: true, new: true },
    );

    return NextResponse.json({ logoUrl });
  } catch (error) {
    console.error("Error uploading logo:", error);
    return NextResponse.json(
      { error: "Failed to upload logo" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const setting = await Settings.findOne({ key: SETTINGS_KEYS.CUSTOM_LOGO });

    if (setting?.value) {
      // Try to delete the file
      try {
        const filePath = path.join(process.cwd(), "public", setting.value);
        await unlink(filePath);
      } catch {
        // File may not exist, that's OK
      }
    }

    await Settings.deleteOne({ key: SETTINGS_KEYS.CUSTOM_LOGO });
    return NextResponse.json({ logoUrl: null });
  } catch (error) {
    console.error("Error deleting logo:", error);
    return NextResponse.json(
      { error: "Failed to delete logo" },
      { status: 500 },
    );
  }
}
