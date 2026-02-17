import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { AssessmentTemplate } from "@/lib/models/AssessmentTemplate";

export async function GET() {
  try {
    await connectToDatabase();
    const liveTemplate = await AssessmentTemplate.findOne({ isLive: true }).select("settings").lean();
    if (!liveTemplate) {
      return NextResponse.json({ shuffle_options: false });
    }
    return NextResponse.json({
      shuffle_options: liveTemplate.settings?.shuffle_options || false,
      shuffle_questions: liveTemplate.settings?.shuffle_questions || false,
    });
  } catch {
    return NextResponse.json({ shuffle_options: false });
  }
}
