import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Question } from "@/lib/models/Question";
import { AssessmentTemplate } from "@/lib/models/AssessmentTemplate";
import { getServerSession } from "next-auth";
import { buildAuthOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const host = request.headers.get("host") ?? undefined;
    const authOptions = buildAuthOptions(host);
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const questions = await Question.find({}).sort({ createdAt: -1 });
    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const host = request.headers.get("host") ?? undefined;
    const authOptions = buildAuthOptions(host);
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const body = await request.json();
    const question = await Question.create({
      ...body,
      version: 1,
      active: true,
    });
    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const host = request.headers.get("host") ?? undefined;
    const authOptions = buildAuthOptions(host);
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id)
      return NextResponse.json(
        { error: "Missing Question ID" },
        { status: 400 },
      );

    const updatedQuestion = await Question.findByIdAndUpdate(
      _id,
      { $set: updateData },
      { new: true, runValidators: true },
    );
    if (!updatedQuestion)
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 },
      );
    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const host = request.headers.get("host") ?? undefined;
    const authOptions = buildAuthOptions(host);
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const force = searchParams.get("force") === "true";
    if (!id)
      return NextResponse.json(
        { error: "Missing Question ID" },
        { status: 400 },
      );

    // Check if question is used in any assessment templates
    const affectedTemplates = await AssessmentTemplate.find({
      questions: id,
    }).lean();

    if (affectedTemplates.length > 0 && !force) {
      // Return warning with affected template info
      return NextResponse.json(
        {
          warning: true,
          message: `This question is used in ${affectedTemplates.length} assessment template(s).`,
          affectedTemplates: affectedTemplates.map((t: any) => ({
            _id: t._id,
            name: t.name,
            isLive: t.isLive,
            questionCount: t.questions?.length || 0,
          })),
        },
        { status: 200 },
      );
    }

    // Delete the question
    const deletedQuestion = await Question.findByIdAndDelete(id);
    if (!deletedQuestion)
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 },
      );

    // Update affected assessment templates: remove question reference and update count
    if (affectedTemplates.length > 0) {
      await AssessmentTemplate.updateMany(
        { questions: id },
        {
          $pull: { questions: id },
          $inc: { question_count: -1 },
        },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Question deleted",
      updatedTemplates: affectedTemplates.length,
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 },
    );
  }
}
