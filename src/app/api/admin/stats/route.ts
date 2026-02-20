import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { buildAuthOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { Session } from "@/lib/models/Session";
import { Question } from "@/lib/models/Question";
import { AssessmentTemplate } from "@/lib/models/AssessmentTemplate";

export async function GET(req: Request) {
  try {
    const host = req.headers.get("host") ?? undefined;
    const authOptions = buildAuthOptions(host);
    const session = await getServerSession(authOptions);
    if (
      !session ||
      !session.user?.role ||
      !["admin", "superadmin"].includes(session.user.role)
    ) {
      console.error("Unauthorized access attempt to /api/admin/stats", {
        hasSession: !!session,
        role: session?.user ? (session.user as any).role : "no-user",
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      activeSessions,
      completedToday,
      completedThisWeek,
      completedThisMonth,
      totalQuestions,
      totalTemplates,
      liveTemplate,
      recentSessions,
      dcasDistribution,
    ] = await Promise.all([
      User.countDocuments({ role: "student" }),
      Session.countDocuments({ status: "in_progress" }),
      Session.countDocuments({
        status: "completed",
        completed_at: { $gte: startOfDay },
      }),
      Session.countDocuments({
        status: "completed",
        completed_at: { $gte: startOfWeek },
      }),
      Session.countDocuments({
        status: "completed",
        completed_at: { $gte: startOfMonth },
      }),
      Question.countDocuments({ active: true }),
      AssessmentTemplate.countDocuments({}),
      AssessmentTemplate.findOne({ isLive: true }).select("name questions"),
      Session.find({ status: "completed" })
        .sort({ completed_at: -1 })
        .limit(10)
        .populate("user_id", "name email")
        .select("user_id score completed_at")
        .lean(),
      Session.aggregate([
        { $match: { status: "completed", "score.primary": { $exists: true } } },
        { $group: { _id: "$score.primary", count: { $sum: 1 } } },
      ]),
    ]);

    const dcasCounts = { D: 0, C: 0, A: 0, S: 0 };
    dcasDistribution.forEach((item: any) => {
      if (item._id && dcasCounts.hasOwnProperty(item._id)) {
        dcasCounts[item._id as keyof typeof dcasCounts] = item.count;
      }
    });
    const totalDcas = Object.values(dcasCounts).reduce((a, b) => a + b, 0);
    const dcasPercentages = {
      D: totalDcas > 0 ? Math.round((dcasCounts.D / totalDcas) * 100) : 0,
      C: totalDcas > 0 ? Math.round((dcasCounts.C / totalDcas) * 100) : 0,
      A: totalDcas > 0 ? Math.round((dcasCounts.A / totalDcas) * 100) : 0,
      S: totalDcas > 0 ? Math.round((dcasCounts.S / totalDcas) * 100) : 0,
    };

    const formattedRecentSessions = recentSessions.map((session: any) => ({
      id: session._id,
      studentName: session.user_id?.name || "Unknown",
      email: session.user_id?.email || "",
      primaryType: session.score?.primary || "N/A",
      completedAt: session.completed_at,
    }));

    return NextResponse.json({
      totalUsers,
      activeSessions,
      completedToday,
      completedThisWeek,
      completedThisMonth,
      totalQuestions,
      totalTemplates,
      liveAssessment: liveTemplate
        ? {
            name: liveTemplate.name,
            questionCount: liveTemplate.questions?.length || 0,
          }
        : null,
      dcasDistribution: dcasCounts,
      dcasPercentages,
      recentSessions: formattedRecentSessions,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
