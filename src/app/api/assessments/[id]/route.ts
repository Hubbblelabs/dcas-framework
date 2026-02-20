import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { AssessmentTemplate } from "@/lib/models/AssessmentTemplate";
import { getServerSession } from "next-auth";
import { buildAuthOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const host = request.headers.get("host") ?? undefined;
    const authOptions = buildAuthOptions(host);
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const { id } = await params;
    const template =
      await AssessmentTemplate.findById(id).populate("questions");
    if (!template)
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 },
      );
    return NextResponse.json(template);
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json(
      { error: "Failed to fetch template" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const host = request.headers.get("host") ?? undefined;
    const authOptions = buildAuthOptions(host);
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const { id } = await params;

    const template = await AssessmentTemplate.findById(id);
    if (!template)
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 },
      );

    if (template.isLive)
      return NextResponse.json(
        { error: "Cannot delete a live assessment template" },
        { status: 400 },
      );

    await AssessmentTemplate.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 },
    );
  }
}
