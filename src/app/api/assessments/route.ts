import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { AssessmentTemplate } from "@/lib/models/AssessmentTemplate";
import "@/lib/models/Question";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
    try {
        await connectToDatabase();
        const templates = await AssessmentTemplate.find({}).populate("questions").sort({ createdAt: -1 });
        return NextResponse.json(templates);
    } catch (error) {
        console.error("Error fetching templates:", error);
        return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();
        const body = await request.json();

        if (body.isLive === true) {
            await AssessmentTemplate.updateMany({}, { isLive: false });
        }

        let questions = body.questions || [];
        if (body.selection_method === "random" && body.question_count > 0) {
            const { Question } = await import("@/lib/models/Question");
            const allQuestions = await Question.find({ active: true });
            const shuffled = allQuestions.sort(() => 0.5 - Math.random());
            questions = shuffled.slice(0, body.question_count).map((q: any) => q._id);
        }

        const template = await AssessmentTemplate.create({
            ...body,
            questions,
            active: body.active ?? true,
            isLive: body.isLive ?? false,
        });

        return NextResponse.json(template, { status: 201 });
    } catch (error) {
        console.error("Error creating template:", error);
        return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectToDatabase();
        const body = await request.json();
        const { _id, ...updateData } = body;

        if (!_id) return NextResponse.json({ error: "Missing Template ID" }, { status: 400 });

        if (updateData.isLive === true) {
            await AssessmentTemplate.updateMany({ _id: { $ne: _id } }, { isLive: false });
        }

        if (updateData.selection_method === "random" && updateData.question_count > 0) {
            if (!updateData.questions || updateData.questions.length === 0) {
                const { Question } = await import("@/lib/models/Question");
                const allQuestions = await Question.find({ active: true });
                const shuffled = allQuestions.sort(() => 0.5 - Math.random());
                updateData.questions = shuffled.slice(0, updateData.question_count).map((q: any) => q._id);
            }
        }

        const updatedTemplate = await AssessmentTemplate.findByIdAndUpdate(
            _id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate("questions");

        if (!updatedTemplate) return NextResponse.json({ error: "Template not found" }, { status: 404 });
        return NextResponse.json(updatedTemplate);
    } catch (error) {
        console.error("Error updating template:", error);
        return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
    }
}
