import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Session } from "@/lib/models/Session";
import { User } from "@/lib/models/User";
import { AssessmentTemplate } from "@/lib/models/AssessmentTemplate";
import { Question } from "@/lib/models/Question";
import { Settings, SETTINGS_KEYS } from "@/lib/models/Settings";
import { createSessionToken } from "@/lib/session-token";

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const sessions = await Session.find({})
      .populate("user_id")
      .populate("template_id")
      .sort({ createdAt: -1 });
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    // Support two modes:
    // 1. Simple mode (from assessment page): { responses, score }
    // 2. Full mode (admin/template-based): { studentName, email, institution, templateId }

    if (body.responses && body.score) {
      // Simple mode - direct save from frontend assessment
      let user = null;

      if (body.userId) {
        user = await User.findById(body.userId);
      } else if (body.email) {
        user = await User.findOne({ email: body.email });
        if (!user) {
          user = await User.create({
            name: body.studentName || "Guest",
            email: body.email,
            role: "student",
          });
        }
      }

      // Find default template if not provided
      let templateId = body.templateId;
      if (!templateId) {
        const template = await AssessmentTemplate.findOne({ isLive: true });
        templateId = template?._id;
      }

      if (!templateId) {
        // Fallback to latest if no live template
        const template = await AssessmentTemplate.findOne().sort({
          createdAt: -1,
        });
        templateId = template?._id;
      }

      const completedAt = new Date();

      // Create session
      const session = await Session.create({
        user_id: user?._id,
        template_id: templateId,
        status: "completed",
        started_at: new Date(),
        completed_at: completedAt,
        responses: body.responses,
        score: body.score,
      });

      // Embed result into user document for fast reads
      if (user) {
        await User.findByIdAndUpdate(user._id, {
          $set: {
            result: {
              session_id: session._id,
              score: body.score,
              completed_at: completedAt,
            },
          },
        });
      }

      const token = await createSessionToken(session._id.toString());
      const response = NextResponse.json({
        sessionId: session._id,
        message: "Session saved",
      });
      response.cookies.set("session_token", token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      });
      return response;
    }

    // Full mode - template-based session creation
    const { studentName, email, institution, templateId } = body;

    // Ensure models are loaded
    if (!Question) throw new Error("Question model not loaded");

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: studentName,
        email: email || `guest_${Date.now()}@example.com`,
        role: "student",
        institution: institution || undefined,
        meta: { institution: institution || undefined },
      });
    }

    let template;
    if (templateId) {
      template = await AssessmentTemplate.findById(templateId);
    } else {
      template = await AssessmentTemplate.findOne({ isLive: true });
    }

    if (!template) {
      return NextResponse.json(
        { error: "No live assessment template found. Please contact admin." },
        { status: 404 },
      );
    }

    const totalQuestionsSetting = await Settings.findOne({
      key: SETTINGS_KEYS.TOTAL_QUESTIONS,
    });
    const maxQuestions = totalQuestionsSetting?.value || 30;

    const fullTemplate = await AssessmentTemplate.findById(
      template._id,
    ).populate("questions");
    let questions = fullTemplate?.questions || [];
    questions = shuffleArray(questions);
    questions = questions.slice(0, maxQuestions);

    const assignedQuestionIds = questions.map((q: any) => q._id);

    const session = await Session.create({
      user_id: user._id,
      template_id: template._id,
      status: "in_progress",
      started_at: new Date(),
      metadata: { user_agent: req.headers.get("user-agent") },
      assigned_questions: assignedQuestionIds,
    });

    const randomizedQuestions = questions.map((q: any) => {
      const questionObj = q.toObject ? q.toObject() : q;
      return { ...questionObj, options: shuffleArray(questionObj.options) };
    });

    const token = await createSessionToken(session._id.toString());
    const response = NextResponse.json({
      sessionId: session._id,
      questions: randomizedQuestions,
      template: template,
      message: "Session created successfully",
    });
    response.cookies.set("session_token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
