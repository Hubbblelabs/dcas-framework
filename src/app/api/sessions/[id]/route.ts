import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Session } from "@/lib/models/Session";
import { Question } from "@/lib/models/Question";
import { User } from "@/lib/models/User";
import { getScoreRange } from "@/lib/dcas/scoring";
import { getCareerRecommendations } from "@/lib/dcas/careers";

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    // Ensure models registered
    if (!Question) console.log("Question model loading...");
    if (!User) console.log("User model loading...");

    const session = await Session.findById(id)
      .populate("template_id")
      .populate("user_id")
      .populate("responses.question_id")
      .populate("assigned_questions");

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    let result = session.toObject();

    let questions: any[] = [];
    if (session.assigned_questions && session.assigned_questions.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      questions = session.assigned_questions.map((q: any) => {
        const questionObj = q.toObject ? q.toObject() : q;
        return { ...questionObj, options: shuffleArray(questionObj.options) };
      });
    }
    result.questions = questions;

    if (session.score && session.score.primary) {
      const scores = session.score.raw;
      const scoreRanges = {
        D: getScoreRange(scores.D),
        C: getScoreRange(scores.C),
        A: getScoreRange(scores.A),
        S: getScoreRange(scores.S),
      };

      const careerRecs = getCareerRecommendations(
        session.score.primary,
        session.score.secondary || session.score.primary,
      ).map((c) => c.title);

      result = {
        ...result,
        session: {
          ...result,
          score: session.score,
        },
        studentName: session.user_id?.name || "Student",
        scores: session.score.raw,
        scoreRanges,
        primaryType: session.score.primary,
        secondaryType: session.score.secondary,
        careerRecommendations: careerRecs,
        createdAt: session.completed_at || session.createdAt,
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();
    const { action, questionId, answer } = body;

    const session = await Session.findById(id);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (action === "save_answer") {
      const existingIdx = session.responses.findIndex(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (r: any) => r.question_id.toString() === questionId,
      );

      const question = await Question.findById(questionId);
      if (!question) {
        return NextResponse.json(
          { error: "Question not found" },
          { status: 400 },
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const selectedOption = question.options.find(
        (o: any) => o.label === answer,
      );
      if (!selectedOption) {
        return NextResponse.json({ error: "Invalid option" }, { status: 400 });
      }

      const responseEntry = {
        question_id: questionId,
        selected_option_label: answer,
        dcas_type: selectedOption.dcas_type,
        responded_at: new Date(),
      };

      if (existingIdx >= 0) {
        session.responses[existingIdx] = responseEntry;
      } else {
        session.responses.push(responseEntry);
      }

      await session.save();
      return NextResponse.json({ success: true });
    } else if (action === "complete") {
      const counts = { D: 0, C: 0, A: 0, S: 0 };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      session.responses.forEach((r: any) => {
        if (
          r.dcas_type &&
          counts[r.dcas_type as keyof typeof counts] !== undefined
        ) {
          counts[r.dcas_type as keyof typeof counts]++;
        }
      });

      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      const percents = {
        D: total ? (counts.D / total) * 100 : 0,
        C: total ? (counts.C / total) * 100 : 0,
        A: total ? (counts.A / total) * 100 : 0,
        S: total ? (counts.S / total) * 100 : 0,
      };

      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      const primary = sorted[0][0];
      const secondary = sorted[1][0];

      session.score = {
        raw: counts,
        percent: percents,
        primary: primary as "D" | "C" | "A" | "S",
        secondary: secondary as "D" | "C" | "A" | "S",
      };
      session.status = "completed";
      session.completed_at = new Date();
      await session.save();

      return NextResponse.json({ success: true, result: session.score });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
