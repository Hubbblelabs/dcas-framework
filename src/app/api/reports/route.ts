import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Session } from "@/lib/models/Session";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session ||
      !session.user?.role ||
      !["admin", "superadmin"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const reports = await Session.find({ status: "completed" })
      .populate("user_id")
      .populate("template_id")
      .sort({ completed_at: -1 })
      .lean();

    const formattedReports = reports.map((report: any) => ({
      _id: report._id,
      user: report.user_id
        ? {
            name: report.user_id.name,
            email: report.user_id.email,
          }
        : undefined,
      guestName: report.metadata?.ip
        ? `Guest (${report.metadata.ip})`
        : "Guest",
      score: report.score
        ? {
            primary: report.score.primary,
            secondary: report.score.secondary,
            D: report.score.percent?.D || report.score.raw?.D || 0,
            C: report.score.percent?.C || report.score.raw?.C || 0,
            A: report.score.percent?.A || report.score.raw?.A || 0,
            S: report.score.percent?.S || report.score.raw?.S || 0,
          }
        : undefined,
      completedAt: report.completed_at,
    }));

    return NextResponse.json(formattedReports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
    }

    await Session.deleteMany({ _id: { $in: ids } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting reports:", error);
    return NextResponse.json(
      { error: "Failed to delete reports" },
      { status: 500 },
    );
  }
}
