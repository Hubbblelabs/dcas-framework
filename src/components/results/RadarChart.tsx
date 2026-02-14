"use client";

import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from "recharts";
import { Scores } from "@/types";

interface ResultRadarChartProps {
    scores: Scores;
}

export function ResultRadarChart({ scores }: ResultRadarChartProps) {
    const data = [
        { subject: "Driver", A: scores.D, fullMark: 10 },
        { subject: "Connector", A: scores.C, fullMark: 10 },
        { subject: "Anchor", A: scores.A, fullMark: 10 },
        { subject: "Strategist", A: scores.S, fullMark: 10 },
    ];

    return (
        <div className="w-full h-[300px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: "#64748b", fontSize: 14, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis
                        angle={30}
                        domain={[0, 15]} // Max score is roughly 15-20 based on 30 questions
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                    />
                    <Radar
                        name="Behavior Profile"
                        dataKey="A"
                        stroke="#2563eb"
                        strokeWidth={3}
                        fill="#3b82f6"
                        fillOpacity={0.5}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
