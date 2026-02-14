import { DCASType, ScoreRange } from "./scoring";

export interface DCASInterpretation {
    title: string;
    traits: string[];
    strengths: string[];
    communicationStyle: string;
    workEnvironment: string;
    stressResponse: string;
    developmentAreas: string[];
}

export const interpretations: Record<DCASType, DCASInterpretation> = {
    D: {
        title: "Driver",
        traits: [
            "Direct and assertive",
            "Results-driven",
            "Competitive",
            "Decisive",
            "Risk-taking",
        ],
        strengths: [
            "Quick decision-making",
            "Natural leadership",
            "Goal achievement",
            "Problem-solving under pressure",
            "Taking initiative",
        ],
        communicationStyle:
            "Direct, brief, and focused on results. Prefers bottom-line communication without excessive details.",
        workEnvironment:
            "Thrives in fast-paced environments with challenges, autonomy, and opportunities for advancement.",
        stressResponse:
            "May become aggressive, impatient, or overly demanding when not in control or when progress is slow.",
        developmentAreas: [
            "Patience and active listening",
            "Collaboration and teamwork",
            "Sensitivity to others' feelings",
            "Delegation without micromanaging",
        ],
    },
    C: {
        title: "Connector",
        traits: [
            "Sociable and enthusiastic",
            "Persuasive",
            "Optimistic",
            "Collaborative",
            "Creative",
        ],
        strengths: [
            "Excellent communication",
            "Building relationships",
            "Motivating others",
            "Creative problem-solving",
            "Networking",
        ],
        communicationStyle:
            "Expressive, friendly, and story-driven. Enjoys conversations and connecting with people.",
        workEnvironment:
            "Prefers interactive, socially engaging environments with recognition and opportunities to influence.",
        stressResponse:
            "May become disorganized, overly emotional, or lose focus when isolated or lacking recognition.",
        developmentAreas: [
            "Focus and follow-through",
            "Attention to detail",
            "Time management",
            "Objective decision-making",
        ],
    },
    A: {
        title: "Anchor",
        traits: [
            "Calm and patient",
            "Supportive",
            "Consistent",
            "Loyal",
            "Harmony-seeking",
        ],
        strengths: [
            "Reliability and dependability",
            "Active listening",
            "Team support",
            "Conflict mediation",
            "Maintaining stability",
        ],
        communicationStyle:
            "Calm, polite, and patient. Prefers respectful, sincere communication with time to process.",
        workEnvironment:
            "Thrives in stable, predictable environments with clear expectations and minimal conflict.",
        stressResponse:
            "May become withdrawn, resistant to change, or avoid confrontation when facing disruptions.",
        developmentAreas: [
            "Assertiveness and speaking up",
            "Embracing change",
            "Making quick decisions",
            "Setting boundaries",
        ],
    },
    S: {
        title: "Strategist",
        traits: [
            "Analytical and detail-oriented",
            "Systematic",
            "Accurate",
            "Cautious",
            "Quality-focused",
        ],
        strengths: [
            "Problem-solving through analysis",
            "High-quality work",
            "Systematic planning",
            "Attention to detail",
            "Objective evaluation",
        ],
        communicationStyle:
            "Precise, formal, and fact-based. Prefers detailed, well-organized communication with data.",
        workEnvironment:
            "Prefers organized, rule-based environments with clear structures and opportunities for quality work.",
        stressResponse:
            "May become overly critical, withdrawn, or perfectionistic when lacking clarity or structure.",
        developmentAreas: [
            "Flexibility and adaptability",
            "Risk-taking",
            "Communication warmth",
            "Accepting imperfection",
        ],
    },
};

export const scoreRangeInterpretations: Record<DCASType, Record<ScoreRange, string>> = {
    D: {
        Low: "Cooperative, cautious, avoids conflict, prefers guided structure",
        Moderate: "Balanced, can take charge when needed but not overly aggressive",
        High: "Strong leader, assertive, decisive, results-driven, competitive",
    },
    C: {
        Low: "Reserved, introspective, not people-driven, prefers solitary work",
        Moderate: "Friendly and social when needed, but not overly expressive",
        High: "Energetic, talkative, persuasive, enjoys teamwork and networking",
    },
    A: {
        Low: "Fast-paced, restless, may dislike routine or slow processes",
        Moderate: "Balanced; can adapt but prefers some level of stability",
        High: "Patient, dependable, harmonious, prefers predictable environments",
    },
    S: {
        Low: "Flexible, spontaneous, dislikes rules and detailed processes",
        Moderate: "Structured when needed, but can adapt to ambiguity",
        High: "Analytical, detail-oriented, systematic, data-driven",
    },
};

export function getInterpretation(type: DCASType): DCASInterpretation {
    return interpretations[type];
}

export function getScoreRangeInterpretation(type: DCASType, range: ScoreRange): string {
    return scoreRangeInterpretations[type][range];
}

export function getCombinedProfileDescription(
    primaryType: DCASType,
    secondaryType: DCASType
): string {
    const profiles: Record<string, string> = {
        DC: "An assertive, persuasive leader who drives results through influence and motivation",
        DA: "A decisive leader who balances assertiveness with stability and team support",
        DS: "An analytical strategist who combines decisiveness with systematic planning",
        CD: "A charismatic influencer who combines social energy with goal-oriented action",
        CA: "A friendly relationship-builder who creates harmony while motivating others",
        CS: "A creative communicator who balances enthusiasm with attention to detail",
        AD: "A supportive team player who can step up to lead when needed",
        AC: "A calm, relationship-focused individual who values harmony and connection",
        AS: "A reliable, detail-oriented executor who ensures consistent quality",
        SD: "An analytical decision-maker who combines logic with assertive action",
        SC: "A systematic thinker who can communicate complex ideas effectively",
        SA: "A methodical, reliable professional who values accuracy and stability",
    };

    const key = `${primaryType}${secondaryType}`;
    return (
        profiles[key] ||
        `A blend of ${interpretations[primaryType].title} and ${interpretations[secondaryType].title} traits`
    );
}
