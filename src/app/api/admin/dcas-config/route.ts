import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Settings, SETTINGS_KEYS } from "@/lib/models/Settings";
import { getServerSession } from "next-auth";
import { buildAuthOptions } from "@/lib/auth";
import { defaultDCASNames } from "@/lib/dcas/scoring";

export async function GET() {
  try {
    await connectToDatabase();
    const setting = await Settings.findOne({ key: SETTINGS_KEYS.DCAS_NAMES });
    const dcasNames = setting ? setting.value : defaultDCASNames;
    return NextResponse.json(dcasNames);
  } catch (error) {
    console.error("Error fetching DCAS config:", error);
    return NextResponse.json(
      { error: "Failed to fetch DCAS configuration" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const host = request.headers.get("host") ?? undefined;
    const authOptions = buildAuthOptions(host);
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const body = await request.json();

    if (!body.D || !body.C || !body.A || !body.S) {
      return NextResponse.json(
        { error: "All 4 DCAS types are required." },
        { status: 400 },
      );
    }

    const updatedSetting = await Settings.findOneAndUpdate(
      { key: SETTINGS_KEYS.DCAS_NAMES },
      {
        key: SETTINGS_KEYS.DCAS_NAMES,
        value: body,
        description: "Custom names for DCAS behavioural types",
      },
      { upsert: true, new: true },
    );

    return NextResponse.json(updatedSetting.value);
  } catch (error) {
    console.error("Error updating DCAS config:", error);
    return NextResponse.json(
      { error: "Failed to update DCAS configuration" },
      { status: 500 },
    );
  }
}
