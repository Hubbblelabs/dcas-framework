"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ResultRadarChart } from "@/components/results/RadarChart";
import { ScoreCard } from "@/components/results/ScoreCard";
import { Scores, Trait, TraitResult } from "@/types";
import { Header } from "@/components/layout/Header";
import { Download, RotateCcw } from "lucide-react";

// Hardcoded interpretation text from requirements document context
const INTERPRETATIONS = {
    D: {
        label: "Driver",
        low: "Cooperative, cautious, avoids conflict, prefers guided structure.",
        moderate: "Balanced – can take charge when needed but not aggressive.",
        high: "Strong leader, assertive, decisive, results-driven, competitive.",
    },
    C: {
        label: "Connector",
        low: "Reserved, introspective, not people-driven, prefers solitary work.",
        moderate: "Friendly and social when needed, but not overly expressive.",
        high: "Energetic, talkative, persuasive, enjoys teamwork and networking.",
    },
    A: {
        label: "Anchor",
        low: "Fast-paced, restless, may dislike routine or slow processes.",
        moderate: "Balanced; can adapt but prefers some level of stability.",
        high: "Patient, dependable, harmonious, prefers predictable environments.",
    },
    S: {
        label: "Strategist",
        low: "Flexible, spontaneous, dislikes rules and detailed processes.",
        moderate: "Structured when needed, but can adapt to ambiguity.",
        high: "Analytical, detail-oriented, systematic, data-driven.",
    },
};

function getLevel(score: number): "Low" | "Moderate" | "High" {
    if (score <= 7) return "Low";
    if (score <= 14) return "Moderate";
    return "High";
}

function ResultsContent() {
    const searchParams = useSearchParams();

    const scores: Scores = {
        D: parseInt(searchParams.get("D") || "0"),
        C: parseInt(searchParams.get("C") || "0"),
        A: parseInt(searchParams.get("A") || "0"),
        S: parseInt(searchParams.get("S") || "0"),
    };

    const traitResults: TraitResult[] = (Object.keys(scores) as Trait[]).map((trait) => {
        const score = scores[trait];
        const level = getLevel(score);
        const info = INTERPRETATIONS[trait];
        return {
            trait,
            score,
            level,
            label: info.label,
            description: info[level.toLowerCase() as keyof typeof info],
        };
    });

    // Sort by score desc to highlight dominant traits
    const sortedTraits = [...traitResults].sort((a, b) => b.score - a.score);
    const primaryTrait = sortedTraits[0];

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />

            <main className="flex-1 py-10 px-4">
                <div className="container mx-auto max-w-5xl space-y-10">

                    <div className="text-center space-y-4">
                        <h1 className="text-3xl font-bold tracking-tight">Your Behavioral Profile</h1>
                        <p className="text-muted-foreground text-lg">
                            Based on your responses, your primary style is <span className="font-bold text-primary">{primaryTrait.label}</span>.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* Chart Section */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border">
                            <h3 className="text-lg font-semibold mb-6 text-center">Profile Visualization</h3>
                            <ResultRadarChart scores={scores} />
                        </div>

                        {/* Detailed Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {traitResults.map((result) => {
                                let colorClass = "text-slate-600";
                                if (result.trait === 'D') colorClass = "text-red-600 bg-red-50";
                                if (result.trait === 'C') colorClass = "text-yellow-600 bg-yellow-50";
                                if (result.trait === 'A') colorClass = "text-green-600 bg-green-50";
                                if (result.trait === 'S') colorClass = "text-blue-600 bg-blue-50";

                                return (
                                    <ScoreCard key={result.trait} result={result} colorClass={colorClass} />
                                );
                            })}
                        </div>
                    </div>

                    {/* Action Area */}
                    <div className="flex justify-center gap-4 pt-10">
                        <Button variant="outline" size="lg" onClick={() => window.print()}>
                            <Download className="mr-2 h-4 w-4" /> Save Report
                        </Button>
                        <Button asChild size="lg">
                            <Link href="/assessment">
                                <RotateCcw className="mr-2 h-4 w-4" /> Retake Assessment
                            </Link>
                        </Button>
                    </div>

                </div>
            </main>
        </div>
    );
}

export default function ResultsPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Loading results...</div>}>
            <ResultsContent />
        </Suspense>
    );
}
