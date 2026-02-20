import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { AssessmentTemplate } from "@/lib/models/AssessmentTemplate";
import "@/lib/models/Question";
import { translateQuestion } from "@/lib/translation";
import { DEFAULT_LANGUAGE, type LanguageCode } from "@/lib/i18n/config";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const langParam = url.searchParams.get("lang") as LanguageCode | null;
    const targetLang: LanguageCode =
      (langParam as LanguageCode) || DEFAULT_LANGUAGE;

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

    const questions = Array.isArray(liveTemplate.questions)
      ? liveTemplate.questions
      : [];

    const translatedQuestions = await Promise.all(
      questions.map((q: any) => translateQuestion(q, targetLang)),
    );

    return NextResponse.json({
      shuffle_options: liveTemplate.settings?.shuffle_options || false,
      shuffle_questions: liveTemplate.settings?.shuffle_questions || false,
      questions: translatedQuestions,
    });
  } catch {
    return NextResponse.json({
      shuffle_options: false,
      shuffle_questions: false,
      questions: [],
    });
  }
}
