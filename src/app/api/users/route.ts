import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { Session } from "@/lib/models/Session";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limitParam = searchParams.get("limit");
    const limit = parseInt(limitParam || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const batch = searchParams.get("batch") || "";
    const institution = searchParams.get("institution") || "";
    const includeStats = searchParams.get("includeStats") === "true";

    const query: any = { role: "student" };
    const andConditions = [];

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      andConditions.push({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
          { "meta.batch": searchRegex },
          { "meta.institution": searchRegex },
          { batch: searchRegex },
          { institution: searchRegex },
        ],
      });
    }

    if (batch) {
      andConditions.push({
        $or: [{ "meta.batch": batch }, { batch: batch }],
      });
    }

    if (institution) {
      andConditions.push({
        $or: [
          { "meta.institution": institution },
          { institution: institution },
        ],
      });
    }

    if (status === "completed") {
      query["result.score.primary"] = { $exists: true };
    } else if (status === "not_attempted") {
      query["result.score.primary"] = { $exists: false };
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const total = await User.countDocuments(query);

    const skip = (page - 1) * limit;
    const queryLimit = limit === 0 ? total : limit;

    const users = await User.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(queryLimit)
      .lean();

    const usersNeedingSession = users.filter(
      (u: any) => !u.result?.score?.primary,
    );
    const userIdsNeedingSession = usersNeedingSession.map((u: any) => u._id);

    let sessionMap: Record<string, any> = {};
    if (userIdsNeedingSession.length > 0) {
      const sessions = await Session.find({
        user_id: { $in: userIdsNeedingSession },
        status: "completed",
      }).lean();

      sessions.forEach((s: any) => {
        const uid = s.user_id.toString();
        if (
          !sessionMap[uid] ||
          new Date(s.completed_at) > new Date(sessionMap[uid].completed_at)
        ) {
          sessionMap[uid] = s;
        }
      });
    }

    const formattedUsers = await Promise.all(
      users.map(async (u: any) => {
        let score = null;
        let latestReportId = null;
        let completedAt = null;
        let userStatus = "Not Attempted";

        if (u.result?.score?.primary) {
          score = {
            primary: u.result.score.primary,
            secondary: u.result.score.secondary,
          };
          latestReportId = u.result.session_id || null;
          completedAt = u.result.completed_at || null;
          userStatus = "Completed";
        } else {
          const session = sessionMap[u._id.toString()];
          if (session) {
            score = session.score
              ? {
                  primary: session.score.primary,
                  secondary: session.score.secondary,
                }
              : null;
            latestReportId = session._id || null;
            completedAt = session.completed_at || null;
            userStatus = "Completed";

            User.findByIdAndUpdate(u._id, {
              $set: {
                result: {
                  session_id: session._id,
                  score: session.score,
                  completed_at: session.completed_at,
                },
              },
            }).catch((err) => console.error("Backfill error:", err));
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
          status: userStatus,
        };
      }),
    );

    let stats = null;
    if (includeStats) {
      const [totalCount, completedCount, uniqueBatches, uniqueInstitutions] =
        await Promise.all([
          User.countDocuments({ role: "student" }),
          User.countDocuments({
            role: "student",
            "result.score.primary": { $exists: true },
          }),
          User.distinct("meta.batch", { role: "student" }),
          User.distinct("meta.institution", { role: "student" }),
        ]);

      stats = {
        totalUsers: totalCount,
        completed: completedCount,
        uniqueBatches: uniqueBatches.filter(Boolean).length,
        uniqueInstitutions: uniqueInstitutions.filter(Boolean).length,
      };
    }

    return NextResponse.json({
      data: formattedUsers,
      meta: {
        total,
        page,
        limit: queryLimit,
        totalPages: limit === 0 ? 1 : Math.ceil(total / (queryLimit || 1)),
        stats,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
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
  try {
    await connectToDatabase();
    const body = await request.json();
    const { _id, ...updateData } = body;
    if (!_id)
      return NextResponse.json({ error: "Missing User ID" }, { status: 400 });

    if (updateData.institution !== undefined) {
      updateData["meta.institution"] = updateData.institution;
    }
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
