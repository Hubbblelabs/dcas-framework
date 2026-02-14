import { NextResponse } from "next/server";
import { Resend } from "resend";
import { connectToDatabase } from "@/lib/mongodb";
import { Session } from "@/lib/models/Session";
import { User } from "@/lib/models/User";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { sessionId } = await req.json();

        if (!sessionId) {
            return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
        }

        await connectToDatabase();

        const session = await Session.findById(sessionId).populate("user_id");

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        const user = session.user_id;

        if (!user || !user.email) {
            return NextResponse.json({ error: "User or email not found" }, { status: 400 });
        }

        const { subject, html } = generateEmailContent(user, session);

        const data = await resend.emails.send({
            from: 'DCAS Assessment <onboarding@resend.dev>', // Or verify domain later
            to: [user.email],
            subject: subject,
            html: html,
        });

        return NextResponse.json(data);

    } catch (error) {
        console.error("Email send error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

function generateEmailContent(user: any, session: any) {
    const scores = session.score?.percent || {};
    const primary = session.score?.primary || "Unknown";
    const secondary = session.score?.secondary || "Unknown";

    // Simple template
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Hi ${user.name},</h1>
            <p>Thank you for completing the DCAS Assessment!</p>
            <h2>Your Results</h2>
            <p><strong>Primary Style:</strong> ${primary}</p>
            <p><strong>Secondary Style:</strong> ${secondary}</p>
            
            <h3>Score Breakdown:</h3>
            <ul>
                <li>Driver (D): ${scores.D}%</li>
                <li>Connector (C): ${scores.C}%</li>
                <li>Anchor (A): ${scores.A}%</li>
                <li>Strategist (S): ${scores.S}%</li>
            </ul>

            <p>View your full report on the platform.</p>
        </div>
    `;

    return {
        subject: `Your DCAS Assessment Results - ${primary}/${secondary}`,
        html
    };
}
