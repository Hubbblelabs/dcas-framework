import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Settings, SETTINGS_KEYS } from "@/lib/models/Settings";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    await connectToDatabase();
    const setting = await Settings.findOne({ key: SETTINGS_KEYS.CUSTOM_LOGO });

    const logoUrl =
      setting?.value && setting.updatedAt
        ? `/api/admin/logo/image?v=${new Date(setting.updatedAt).getTime()}`
        : null;

    return NextResponse.json(
      {
        logoUrl,
        updatedAt: setting?.updatedAt,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=0, must-revalidate",
        },
      },
    );
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
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const validTypes = [
      "image/png",
      "image/jpeg",
      "image/svg+xml",
      "image/webp",
    ];
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
    const base64String = buffer.toString("base64");
    const logoUrlData = `data:${file.type};base64,${base64String}`;

    const updatedSetting = await Settings.findOneAndUpdate(
      { key: SETTINGS_KEYS.CUSTOM_LOGO },
      {
        key: SETTINGS_KEYS.CUSTOM_LOGO,
        value: logoUrlData,
        description: "Custom logo base64 data",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const newLogoUrl = `/api/admin/logo/image?v=${new Date(
      updatedSetting.updatedAt,
    ).getTime()}`;

    return NextResponse.json({ logoUrl: newLogoUrl });
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
