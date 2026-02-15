"use client"

import { DCASScores, dcasColors, defaultDCASNames } from "@/lib/dcas/scoring"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
} from "recharts"

interface DCASChartProps {
    scores: DCASScores
}

export function DCASBarChart({ scores }: DCASChartProps) {
    const data = [
        { name: defaultDCASNames.D, value: scores.D, color: dcasColors.D.primary, shortName: "D" },
        { name: defaultDCASNames.C, value: scores.C, color: dcasColors.C.primary, shortName: "C" },
        { name: defaultDCASNames.A, value: scores.A, color: dcasColors.A.primary, shortName: "A" },
        { name: defaultDCASNames.S, value: scores.S, color: dcasColors.S.primary, shortName: "S" },
    ]

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                    dataKey="shortName"
                    className="text-sm fill-muted-foreground"
                    tick={{ fill: 'currentColor' }}
                />
                <YAxis
                    domain={[0, 30]}
                    className="text-sm fill-muted-foreground"
                    tick={{ fill: 'currentColor' }}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))',
                    }}
                    formatter={(value, name) => [value ?? 0, name]}
                    labelFormatter={(label) => {
                        const item = data.find(d => d.shortName === label)
                        return item?.name || label
                    }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={80}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}

export function DCASRadarChart({ scores }: DCASChartProps) {
    const data = [
        { subject: "D", fullName: defaultDCASNames.D, value: scores.D, fullMark: 30, color: dcasColors.D.primary },
        { subject: "C", fullName: defaultDCASNames.C, value: scores.C, fullMark: 30, color: dcasColors.C.primary },
        { subject: "A", fullName: defaultDCASNames.A, value: scores.A, fullMark: 30, color: dcasColors.A.primary },
        { subject: "S", fullName: defaultDCASNames.S, value: scores.S, fullMark: 30, color: dcasColors.S.primary },
    ]

    const CustomTick = ({ payload, x = 0, y = 0, textAnchor }: { payload: { value: string }, x?: number | string, y?: number | string, textAnchor?: "inherit" | "end" | "start" | "middle" }) => {
        const item = data.find(d => d.subject === payload.value)
        return (
            <g transform={`translate(${x},${y})`}>
                <text textAnchor={textAnchor} fill={item?.color || 'currentColor'} fontSize={14} fontWeight="bold" dy={4}>
                    {payload.value}
                </text>
            </g>
        )
    }

    return (
        <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-2xl" />
            </div>
            <ResponsiveContainer width="100%" height={350}>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <defs>
                        <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={dcasColors.D.primary} stopOpacity={0.8} />
                            <stop offset="33%" stopColor={dcasColors.C.primary} stopOpacity={0.8} />
                            <stop offset="66%" stopColor={dcasColors.A.primary} stopOpacity={0.8} />
                            <stop offset="100%" stopColor={dcasColors.S.primary} stopOpacity={0.8} />
                        </linearGradient>
                        <linearGradient id="radarFillGradient" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={dcasColors.D.primary} stopOpacity={0.3} />
                            <stop offset="33%" stopColor={dcasColors.C.primary} stopOpacity={0.3} />
                            <stop offset="66%" stopColor={dcasColors.A.primary} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={dcasColors.S.primary} stopOpacity={0.3} />
                        </linearGradient>
                    </defs>
                    <PolarGrid stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} radialLines={true} />
                    <PolarAngleAxis dataKey="subject" tick={(props) => <CustomTick {...props} />} tickLine={false} />
                    <PolarRadiusAxis angle={90} domain={[0, 30]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} tickCount={4} axisLine={false} />
                    <Radar
                        name="DCAS Profile"
                        dataKey="value"
                        stroke="url(#radarGradient)"
                        fill="url(#radarFillGradient)"
                        strokeWidth={3}
                        dot={{ r: 6, fill: 'hsl(var(--card))', stroke: 'url(#radarGradient)', strokeWidth: 2 }}
                        activeDot={{ r: 8, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--card))', strokeWidth: 2 }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '12px',
                            color: 'hsl(var(--foreground))',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                            padding: '12px 16px',
                        }}
                        formatter={(value, _name, props) => {
                            const numValue = typeof value === 'number' ? value : 0
                            const percentage = Math.round((numValue / 30) * 100)
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const payload = (props as any).payload
                            return [`${numValue} / 30 (${percentage}%)`, payload?.fullName || '']
                        }}
                    />
                </RadarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2 flex-wrap">
                {data.map((item) => (
                    <div key={item.subject} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-muted-foreground">{item.fullName}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

interface ScoreCardProps {
    type: 'D' | 'C' | 'A' | 'S'
    score: number
    maxScore?: number
}

export function ScoreCard({ type, score, maxScore = 30 }: ScoreCardProps) {
    const config = { ...dcasColors[type], name: defaultDCASNames[type] }
    const percentage = (score / maxScore) * 100

    let level: string
    let levelColor: string

    if (score <= 7) {
        level = "Low"
        levelColor = "text-muted-foreground"
    } else if (score <= 14) {
        level = "Moderate"
        levelColor = "text-amber-500"
    } else {
        level = "High"
        levelColor = "text-emerald-500"
    }

    return (
        <div className="relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{config.name}</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold" style={{ color: config.primary }}>{score}</span>
                        <span className="text-sm text-muted-foreground">/ {maxScore}</span>
                    </div>
                    <p className={`text-sm font-medium ${levelColor}`}>{level}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl" style={{ backgroundColor: config.light }}>
                    {type}
                </div>
            </div>
            <div className="mt-4">
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${percentage}%`, backgroundColor: config.primary }} />
                </div>
            </div>
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10" style={{ backgroundColor: config.primary }} />
        </div>
    )
}
