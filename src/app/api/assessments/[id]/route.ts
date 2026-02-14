import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { AssessmentTemplate } from "@/lib/models/AssessmentTemplate";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();
        const { id } = await params;
        const template = await AssessmentTemplate.findById(id).populate("questions");
        if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });
        return NextResponse.json(template);
    } catch (error) {
        console.error("Error fetching template:", error);
        return NextResponse.json({ error: "Failed to fetch template" }, { status: 500 });
    }
}
