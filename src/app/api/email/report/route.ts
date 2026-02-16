import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { connectToDatabase } from "@/lib/mongodb";
import { Session } from "@/lib/models/Session";
import { User } from "@/lib/models/User";
import {
  interpretations,
  getCombinedProfileDescription,
} from "@/lib/dcas/interpretations";
import { DCASType, defaultDCASNames } from "@/lib/dcas/scoring";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const session = await Session.findById(sessionId).populate("user_id");

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const user = session.user_id;

    if (!user || !user.email) {
      return NextResponse.json(
        { error: "User or email not found" },
        { status: 400 },
      );
    }

    const { subject, html } = generateEmailContent(user, session);

    const info = await transporter.sendMail({
      from:
        process.env.SMTP_FROM ||
        '"DCAS Assessment" <no-reply@dcas-assessment.com>',
      to: user.email,
      subject: subject,
      html: html,
    });

    return NextResponse.json({ id: info.messageId });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

function generateEmailContent(user: any, session: any) {
  const scores = session.score?.raw || {}; // Use raw scores for display
  const rawScores = session.score?.raw || {};
  const percentScores = session.score?.percent || {};

  // Determine ranks if not present, though usually they are calculated on frontend.
  // We trust session.score.primary/secondary if available, otherwise recalculate.
  let primary: DCASType = session.score?.primary || "D";
  let secondary: DCASType = session.score?.secondary || "C";

  if (!session.score?.primary) {
    // Fallback calculation if needed
    const types: DCASType[] = ["D", "C", "A", "S"];
    types.sort((a, b) => (rawScores[b] || 0) - (rawScores[a] || 0));
    primary = types[0];
    secondary = types[1];
  }

  const primaryInterp = interpretations[primary];
  const profileDesc = getCombinedProfileDescription(primary, secondary);

  // Theme colors
  const colors: Record<string, string> = {
    D: "#dc2626", // red-600
    C: "#eab308", // yellow-500
    A: "#10b981", // emerald-500
    S: "#3b82f6", // blue-500
    primary: "#4f46e5", // indigo-600
    text: "#1e293b", // slate-800
    textLight: "#64748b", // slate-500
    bg: "#f8fafc", // slate-50
  };

  const styles = {
    container: `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: ${colors.text};`,
    header: `background: linear-gradient(135deg, ${colors.primary}, #9333ea); padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0;`,
    headerTitle:
      "color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;",
    headerSubtitle:
      "color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px;",
    section: "padding: 32px 24px; border-bottom: 1px solid #e2e8f0;",
    h2: `color: ${colors.text}; margin: 0 0 16px; font-size: 20px; font-weight: bold;`,
    h3: `color: ${colors.text}; margin: 24px 0 12px; font-size: 16px; font-weight: bold;`,
    p: `color: ${colors.textLight}; margin: 0 0 16px; line-height: 1.6; font-size: 15px;`,
    badge:
      "display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 500; background-color: #f1f5f9; color: #475569; margin-right: 8px;",
    scoreRow:
      "display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f1f5f9;",
    scoreLabel: `font-weight: 600; color: ${colors.text};`,
    scoreValue: "font-weight: bold;",
    list: "margin: 0; padding: 0; list-style: none;",
    listItem: "margin-bottom: 12px; position: relative; padding-left: 20px;",
    bullet: `position: absolute; left: 0; top: 6px; width: 6px; height: 6px; border-radius: 50%; background-color: ${colors.primary};`,
    button: `display: inline-block; background-color: ${colors.primary}; color: #ffffff; padding: 14px 28px; border-radius: 9999px; text-decoration: none; font-weight: 600; margin-top: 24px;`,
    footer: `padding: 32px 24px; text-align: center; color: ${colors.textLight}; font-size: 13px; background-color: ${colors.bg}; border-radius: 0 0 12px 12px;`,
  };

  const html = `
        <div style="${styles.container}">
            <div style="${styles.header}">
                <div style="font-size: 48px; margin-bottom: 16px;">💎</div>
                <h1 style="${styles.headerTitle}">Your DCAS Profile</h1>
                <p style="${styles.headerSubtitle}">Assessment Report for ${user.name}</p>
            </div>

            <!-- Profile Summary -->
            <div style="${styles.section}">
                <h2 style="${styles.h2}">${defaultDCASNames[primary]} Profile</h2>
                <div style="margin-bottom: 16px;">
                    <span style="${styles.badge}">Primary: ${primary}</span>
                    <span style="${styles.badge}">Secondary: ${secondary}</span>
                </div>
                <p style="${styles.p}"><strong>${profileDesc}</strong></p>
                <p style="${styles.p}">${primaryInterp.traits.join(" · ")}</p>
            </div>

            <!-- Score Breakdown -->
            <div style="${styles.section}">
                <h2 style="${styles.h2}">Score Breakdown</h2>
                <div style="${styles.scoreRow}">
                    <span style="${styles.scoreLabel}">Driver (D)</span>
                    <span style="${styles.scoreValue}" style="color: ${colors.D}">${rawScores.D} / 30</span>
                </div>
                <div style="${styles.scoreRow}">
                    <span style="${styles.scoreLabel}">Connector (C)</span>
                    <span style="${styles.scoreValue}" style="color: ${colors.C}">${rawScores.C} / 30</span>
                </div>
                <div style="${styles.scoreRow}">
                    <span style="${styles.scoreLabel}">Anchor (A)</span>
                    <span style="${styles.scoreValue}" style="color: ${colors.A}">${rawScores.A} / 30</span>
                </div>
                <div style="${styles.scoreRow}">
                    <span style="${styles.scoreLabel}">Strategist (S)</span>
                    <span style="${styles.scoreValue}" style="color: ${colors.S}">${rawScores.S} / 30</span>
                </div>
            </div>

            <!-- Detailed Analysis -->
            <div style="${styles.section}">
                <h2 style="${styles.h2}">Detailed Analysis</h2>
                
                <h3 style="${styles.h3}">Core Strengths</h3>
                <ul style="${styles.list}">
                    ${primaryInterp.strengths
                      .slice(0, 4)
                      .map(
                        (s) => `
                        <li style="${styles.listItem}">
                            <span style="${styles.bullet}"></span>${s}
                        </li>
                    `,
                      )
                      .join("")}
                </ul>

                <h3 style="${styles.h3}">Development Areas</h3>
                <ul style="${styles.list}">
                    ${primaryInterp.developmentAreas
                      .slice(0, 3)
                      .map(
                        (d) => `
                        <li style="${styles.listItem}">
                            <span style="${styles.bullet.replace(colors.primary, colors.D)}"></span>${d}
                        </li>
                    `,
                      )
                      .join("")}
                </ul>

                <h3 style="${styles.h3}">Communication Style</h3>
                <p style="${styles.p}">${primaryInterp.communicationStyle}</p>

                <h3 style="${styles.h3}">Work Environment</h3>
                <p style="${styles.p}">${primaryInterp.workEnvironment}</p>
            </div>

            <!-- CTA -->
            <div style="${styles.section}; text-align: center; background-color: ${colors.bg};">
                <h2 style="${styles.h2}">Unlock Your Full Potential</h2>
                <p style="${styles.p}">View detailed career recommendations and download your full PDF report on the platform.</p>
                <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/report/${session._id}" style="${styles.button}">View Full Report</a>
            </div>

            <div style="${styles.footer}">
                <p>© ${new Date().getFullYear()} DCAS Assessment. All rights reserved.</p>
            </div>
        </div>
    `;

  return {
    subject: `Your Detailed DCAS Report: The ${defaultDCASNames[primary]}`, // e.g. "The Driver"
    html,
  };
}
