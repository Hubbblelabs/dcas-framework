import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { buildAuthOptions } from "@/lib/auth";
import { verifySessionToken } from "@/lib/session-token";
import { connectToDatabase } from "@/lib/mongodb";
import { Session } from "@/lib/models/Session";
import { Question } from "@/lib/models/Question";
import { User } from "@/lib/models/User";
import Admin from "@/lib/models/Admin";
import {
  getScoreRange,
  calculateScores,
  calculatePercentages,
  getRankedTypes,
} from "@/lib/dcas/scoring";
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
    const { id } = await params;

    const host = _req.headers.get("host") ?? undefined;
    const authOptions = buildAuthOptions(host);
    const sessionAuth = await getServerSession(authOptions);
    const isAdmin = ["admin", "superadmin"].includes(
      (sessionAuth?.user as any)?.role,
    );

    let isOwner = false;
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    if (token) {
      const decoded = await verifySessionToken(token);
      if (decoded && decoded.sessionId === id) {
        isOwner = true;
      }
    }

    await connectToDatabase();

    // First, check if the session exists and is completed
    const session = await Session.findById(id)
      .populate("template_id")
      .populate("user_id")
      .populate("responses.question_id")
      .populate("assigned_questions")
      .populate("followups.created_by", "name email");

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Allow public access to completed sessions (results viewing)
    // Restrict in-progress sessions to admin or owner only
    const isCompleted = session.status === "completed";

    if (!isCompleted && !isAdmin && !isOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let result = session.toObject();

    let questions: any[] = [];
    if (session.assigned_questions && session.assigned_questions.length > 0) {
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
        followups: session.followups || [],
      };
    } else {
      // Include followups even if no score
      result.followups = session.followups || [];
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
    const { id } = await params;

    const host = req.headers.get("host") ?? undefined;
    const authOptions = buildAuthOptions(host);
    const sessionAuth = await getServerSession(authOptions);
    const isAdmin = ["admin", "superadmin"].includes(
      (sessionAuth?.user as any)?.role,
    );

    let isOwner = false;
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    if (token) {
      const decoded = await verifySessionToken(token);
      if (decoded && decoded.sessionId === id) {
        isOwner = true;
      }
    }

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { action, questionId, answer, note, status } = body;

    const session = await Session.findById(id);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (action === "save_answer") {
      const existingIdx = session.responses.findIndex(
        (r: any) => r.question_id.toString() === questionId,
      );

      const question = await Question.findById(questionId);
      if (!question) {
        return NextResponse.json(
          { error: "Question not found" },
          { status: 400 },
        );
      }

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
      const types = session.responses.map((r: any) => r.dcas_type);
      const counts = calculateScores(types);
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      const percents = calculatePercentages(counts, total);
      const ranked = getRankedTypes(counts);

      session.score = {
        raw: counts,
        percent: percents,
        primary: ranked[0],
        secondary: ranked[1],
      };
      session.status = "completed";
      session.completed_at = new Date();
      await session.save();

      // Embed result into user document for fast reads
      if (session.user_id) {
        await User.findByIdAndUpdate(session.user_id, {
          $set: {
            result: {
              session_id: session._id,
              score: session.score,
              completed_at: session.completed_at,
            },
          },
        });
      }

      return NextResponse.json({ success: true, result: session.score });
    } else if (action === "add_followup" && isAdmin) {
      if (!status || !note) {
        return NextResponse.json(
          { error: "Status and note are required" },
          { status: 400 },
        );
      }

      const adminUser = await Admin.findById((sessionAuth?.user as any)?.id) || await Admin.findOne({ email: sessionAuth?.user?.email });
      if (!adminUser) {
        return NextResponse.json(
          { error: "Admin not found" },
          { status: 400 },
        );
      }

      const finalStatus = status === "none" ? "needs_followup" : status;

      session.followups = session.followups || [];
      session.followups.push({
        date: new Date(),
        created_by: adminUser._id,
        note,
        status: finalStatus,
      } as any);

      await session.save();

      if (session.user_id) {
        await User.findByIdAndUpdate(session.user_id, {
          $set: {
            followup_status: finalStatus,
            last_followup_at: new Date(),
          },
        });
      }

      return NextResponse.json({ success: true });
    } else if (action === "update_followup_status" && isAdmin) {
      if (!status) {
        return NextResponse.json(
          { error: "Status is required" },
          { status: 400 },
        );
      }
      
      const finalStatus = status === "none" ? "needs_followup" : status;

      if (session.user_id) {
        await User.findByIdAndUpdate(session.user_id, {
          $set: {
            followup_status: finalStatus,
            last_followup_at: new Date(),
          },
        });
      }

      return NextResponse.json({ success: true });
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
