import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Settings, SETTINGS_KEYS } from "@/lib/models/Settings";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const setting = await Settings.findOne({ key: SETTINGS_KEYS.CUSTOM_LOGO });

    if (!setting || !setting.value) {
      return new NextResponse(null, { status: 404 });
    }

    const matches = setting.value.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
      return new NextResponse("Invalid image data", { status: 500 });
    }

    const contentType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving logo image:", error);
    return NextResponse.json(
      { error: "Failed to fetch logo image" },
      { status: 500 },
    );
  }
}
