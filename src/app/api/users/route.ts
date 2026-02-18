import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { Session } from "@/lib/models/Session";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { FilterQuery } from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const batch = searchParams.get("batch") || "all";
    const institution = searchParams.get("institution") || "all";
    const sortField = searchParams.get("sort") || "created_at";
    const sortOrder = searchParams.get("order") === "asc" ? 1 : -1;

    // Build Query
    const andConditions: FilterQuery<any>[] = [{ role: "student" }];

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      andConditions.push({
        $or: [
            { name: searchRegex },
            { email: searchRegex },
            { phone: searchRegex },
            { "meta.batch": searchRegex },
            { "meta.institution": searchRegex },
            { institution: searchRegex },
            { batch: searchRegex },
        ]
      });
    }

    if (batch && batch !== "all") {
        andConditions.push({
            $or: [
                { "meta.batch": batch },
                { batch: batch }
            ]
        });
    }

    if (institution && institution !== "all") {
        andConditions.push({
            $or: [
                { "meta.institution": institution },
                { institution: institution }
            ]
        });
    }

    if (status === "Completed") {
        andConditions.push({ "result.score.primary": { $exists: true } });
    } else if (status === "Not Attempted") {
        andConditions.push({ "result.score.primary": { $exists: false } });
    }

    const finalQuery = { $and: andConditions };

    const skip = (page - 1) * limit;

    // Fetch Users, Count, and Facets
    const [users, total, batches, institutions] = await Promise.all([
      User.find(finalQuery)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(finalQuery),
      User.distinct("meta.batch", { role: "student" }),
      User.distinct("meta.institution", { role: "student" }),
    ]);

    // Optimize N+1: Batch fetch sessions for these users
    const userIds = users.map((u: any) => u._id);

    const sessions = await Session.find({
        user_id: { $in: userIds },
        status: "completed"
    }).lean();

    const sessionMap = new Map();
    sessions.forEach((s: any) => {
        const uid = s.user_id.toString();
        if (!sessionMap.has(uid) || new Date(s.completed_at) > new Date(sessionMap.get(uid).completed_at)) {
            sessionMap.set(uid, s);
        }
    });

    const formattedUsers = users.map((u: any) => {
        let score = null;
        let latestReportId = null;
        let completedAt = null;
        let status = "Not Attempted";

        if (u.result?.score?.primary) {
            score = {
                primary: u.result.score.primary,
                secondary: u.result.score.secondary,
            };
            latestReportId = u.result.session_id || null;
            completedAt = u.result.completed_at || null;
            status = "Completed";
        } else {
            const s = sessionMap.get(u._id.toString());
            if (s) {
                score = s.score
                  ? { primary: s.score.primary, secondary: s.score.secondary }
                  : null;
                latestReportId = s._id || null;
                completedAt = s.completed_at || null;
                status = "Completed";
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
    });

    return NextResponse.json({
        users: formattedUsers,
        metadata: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
            facets: {
                batches: batches.filter(Boolean).sort(),
                institutions: institutions.filter(Boolean).sort()
            }
        }
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
