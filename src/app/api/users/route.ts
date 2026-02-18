import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { Session } from "@/lib/models/Session";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const users = await User.find({ role: "student" })
      .sort({ created_at: -1 })
      .lean();

    const formattedUsers = await Promise.all(
      users.map(async (u: any) => {
        // Try to read from embedded result first
        let score = null;
        let latestReportId = null;
        let completedAt = null;
        let status = "Not Attempted";

        if (u.result?.score?.primary) {
          // Use embedded result data
          score = {
            primary: u.result.score.primary,
            secondary: u.result.score.secondary,
          };
          latestReportId = u.result.session_id || null;
          completedAt = u.result.completed_at || null;
          status = "Completed";
        } else {
          // Fallback: query Session collection for backward compat
          const session = await Session.findOne({
            user_id: u._id,
            status: "completed",
          })
            .sort({ completed_at: -1 })
            .lean();

          if (session) {
            const s = session as any;
            score = s.score
              ? { primary: s.score.primary, secondary: s.score.secondary }
              : null;
            latestReportId = s._id || null;
            completedAt = s.completed_at || null;
            status = "Completed";

            // Backfill: embed result into user document for future reads
            await User.findByIdAndUpdate(u._id, {
              $set: {
                result: {
                  session_id: s._id,
                  score: s.score,
                  completed_at: s.completed_at,
                },
              },
            });
          }
        }

        return {
          ...u,
          createdAt: u.created_at,
          id: u._id,
          phone: u.phone || "",
          batch: u.meta?.batch || u.batch || "",
          institution: u.institution || u.meta?.institution || "",
          latestReportId,
          score,
          completedAt,
          status,
        };
      }),
    );

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const body = await request.json();
    const existing = await User.findOne({ email: body.email });
    if (existing)
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 },
      );
    const user = await User.create({
      ...body,
      role: "student",
      institution: body.institution || undefined,
      meta: {
        batch: body.batch || body.meta?.batch || undefined,
        institution: body.institution || body.meta?.institution || undefined,
      },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const body = await request.json();
    const { _id, ...updateData } = body;
    if (!_id)
      return NextResponse.json({ error: "Missing User ID" }, { status: 400 });

    // If institution is being updated, sync to both top-level and meta
    if (updateData.institution !== undefined) {
      updateData["meta.institution"] = updateData.institution;
    }
    // If batch is being updated, sync to meta.batch
    if (updateData.batch !== undefined) {
      updateData["meta.batch"] = updateData.batch;
    }

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { $set: updateData },
      { new: true },
    ).lean();

    const u = updatedUser as any;
    return NextResponse.json({
      ...u,
      createdAt: u?.created_at,
      id: u?._id,
      institution: u?.institution || u?.meta?.institution || "",
      batch: u?.meta?.batch || "",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "Missing User ID" }, { status: 400 });
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
