import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Settings, SETTINGS_KEYS } from "@/lib/models/Settings";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const DEFAULT_SETTINGS = {
  [SETTINGS_KEYS.TOTAL_QUESTIONS]: 30,
  [SETTINGS_KEYS.ASSESSMENT_TIME_LIMIT]: 0,
  [SETTINGS_KEYS.ALLOW_GUEST_ASSESSMENTS]: true,
  [SETTINGS_KEYS.REQUIRE_EMAIL]: false,
  [SETTINGS_KEYS.SITE_NAME]: "DCAS Assessment",
};

export async function GET() {
  try {
    await connectToDatabase();
    const settings = await Settings.find({ key: { $ne: SETTINGS_KEYS.CUSTOM_LOGO } });
    const settingsObj: Record<string, any> = { ...DEFAULT_SETTINGS };
    settings.forEach((s) => {
      settingsObj[s.key] = s.value;
    });
    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const body = await request.json();
    const updates = [];
    for (const [key, value] of Object.entries(body)) {
      updates.push(
        Settings.findOneAndUpdate(
          { key },
          { key, value, description: `Setting for ${key}` },
          { upsert: true, new: true },
        ),
      );
    }
    await Promise.all(updates);

    const settings = await Settings.find({ key: { $ne: SETTINGS_KEYS.CUSTOM_LOGO } });
    const settingsObj: Record<string, any> = { ...DEFAULT_SETTINGS };
    settings.forEach((s) => {
      settingsObj[s.key] = s.value;
    });
    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
