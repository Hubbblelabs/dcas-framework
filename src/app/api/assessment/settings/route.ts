import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { AssessmentTemplate } from "@/lib/models/AssessmentTemplate";
import "@/lib/models/Question";

export async function GET() {
  try {
    await connectToDatabase();
    const liveTemplate = await AssessmentTemplate.findOne({ isLive: true })
      .populate("questions")
      .lean();

    if (!liveTemplate) {
      return NextResponse.json({
        shuffle_options: false,
        shuffle_questions: false,
        questions: [],
      });
    }

    return NextResponse.json({
      shuffle_options: liveTemplate.settings?.shuffle_options || false,
      shuffle_questions: liveTemplate.settings?.shuffle_questions || false,
      questions: liveTemplate.questions || [],
    });
  } catch {
    return NextResponse.json({
      shuffle_options: false,
      shuffle_questions: false,
      questions: [],
    });
  }
}
