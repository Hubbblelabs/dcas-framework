import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { buildAuthOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Session } from "@/lib/models/Session";
import Admin from "@/lib/models/Admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const host = request.headers.get("host") ?? undefined;
  const authOptions = buildAuthOptions(host);
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await connectToDatabase();

    // Fetch all completed sessions for this user with follow-ups
    const sessions = await Session.find({
      user_id: id,
      status: "completed",
      followups: { $exists: true, $ne: [] },
    })
      .populate("followups.created_by", "name email")
      .sort({ completed_at: -1 })
      .lean();

    // Flatten all follow-ups from all sessions
    const allFollowups: any[] = [];
    sessions.forEach((session: any) => {
      if (session.followups && Array.isArray(session.followups)) {
        session.followups.forEach((followup: any) => {
          allFollowups.push({
            ...followup,
            sessionId: session._id,
            completedAt: session.completed_at,
          });
        });
      }
    });

    // Sort by date (most recent first)
    allFollowups.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({ followups: allFollowups });
  } catch (error) {
    console.error("Error fetching follow-up history:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
