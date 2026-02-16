"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DCASBarChart, DCASRadarChart, ScoreCard } from "@/components/charts/dcas-charts"
import { DCASScores, DCASType, dcasColors, defaultDCASNames, getScoreLevel } from "@/lib/dcas/scoring"
import { interpretations, getCombinedProfileDescription } from "@/lib/dcas/interpretations"
import { getCareerRecommendations } from "@/lib/dcas/careers"
import { ModeToggle } from "@/components/theme-toggle"

export default function ResultsPage() {
    const router = useRouter()
    const params = useParams()
    const sessionId = params.id as string
    const [scores, setScores] = useState<DCASScores | null>(null)
    const [rankedTypes, setRankedTypes] = useState<DCASType[]>([])
    const [chartType, setChartType] = useState<"bar" | "radar">("bar")
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        if (sessionId === "local") {
            const storedScores = sessionStorage.getItem("dcasScores")
            const storedRankedTypes = sessionStorage.getItem("dcasRankedTypes")
            if (storedScores && storedRankedTypes) {
                setScores(JSON.parse(storedScores))
                setRankedTypes(JSON.parse(storedRankedTypes))
                setIsLoaded(true)
            } else {
                router.push("/assessment")
            }
        } else {
            fetch(`/api/sessions/${sessionId}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.session?.score) {
                        setScores(data.session.score.raw)
                        const ranked: DCASType[] = []
                        if (data.session.score.primary) ranked.push(data.session.score.primary)
                        if (data.session.score.secondary) ranked.push(data.session.score.secondary)
                        const types: DCASType[] = ["D", "C", "A", "S"]
                        types.sort((a, b) => (data.session.score.raw[b] || 0) - (data.session.score.raw[a] || 0))
                        const fullRanked = [...new Set([...ranked, ...types])] as DCASType[]
                        setRankedTypes(fullRanked)
                        setIsLoaded(true)
                    } else {
                        router.push("/assessment")
                    }
                })
                .catch(() => router.push("/assessment"))
        }
    }, [sessionId, router])

    if (!isLoaded || !scores) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <div className="text-center px-4">
                    <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Loading your results...</p>
                </div>
            </div>
        )
    }

    const primaryType = rankedTypes[0]
    const secondaryType = rankedTypes[1]
    const primaryInterp = interpretations[primaryType]
    const careers = getCareerRecommendations(primaryType, secondaryType)
    const profileDesc = getCombinedProfileDescription(primaryType, secondaryType)

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 h-40 w-40 sm:h-80 sm:w-80 rounded-full blur-3xl opacity-30" style={{ backgroundColor: dcasColors[primaryType].primary }} />
                <div className="absolute bottom-0 -left-20 sm:-left-40 h-40 w-40 sm:h-80 sm:w-80 rounded-full blur-3xl opacity-20" style={{ backgroundColor: dcasColors[secondaryType].primary }} />
            </div>

            <header className="relative z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg top-0">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 text-xs sm:text-sm font-bold text-white">D</div>
                            <span className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base hidden sm:inline">DCAS Assessment</span>
                        </Link>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <ModeToggle />
                            <Link href={`/report/${sessionId}`}>
                                <Button variant="outline" className="rounded-full text-sm btn-press gap-2 border-indigo-200 dark:border-indigo-800">
                                    <span>📥</span>
                                    <span className="hidden sm:inline">Detailed Report</span>
                                </Button>
                            </Link>
                            <Link href="/assessment">
                                <Button variant="ghost" className="rounded-full text-sm btn-press">Retake</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
                <div className="text-center mb-8 sm:mb-12 animate-fade-in">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mb-4 sm:mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                        </span>
                        Assessment Complete
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">
                        Your DCAS Behavioural Profile
                    </h1>
                    <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto px-2">
                        Based on your responses, we&apos;ve identified your behavioral tendencies and career alignment.
                    </p>
                </div>

                {/* Primary Type Hero */}
                <Card className="border-0 shadow-2xl overflow-hidden mb-6 sm:mb-8 animate-fade-in-up">
                    <div className="h-1.5 sm:h-2" style={{ background: `linear-gradient(to right, ${dcasColors[primaryType].primary}, ${dcasColors[secondaryType].primary})` }} />
                    <CardContent className="p-4 sm:p-6 lg:p-8">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                            <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl text-3xl sm:text-4xl font-bold text-white shadow-xl shrink-0" style={{ background: `linear-gradient(135deg, ${dcasColors[primaryType].primary}, ${dcasColors[primaryType].primary}dd)` }}>
                                {primaryType}
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-2">
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">The {defaultDCASNames[primaryType]}</h2>
                                    <Badge className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs" style={{ backgroundColor: dcasColors[primaryType].light, color: dcasColors[primaryType].primary }}>Primary Type</Badge>
                                </div>
                                <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-400 mb-3 sm:mb-4">{profileDesc}</p>
                                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                                    <Badge variant="outline" className="rounded-full text-xs sm:text-sm">{defaultDCASNames[primaryType]}</Badge>
                                    <Badge variant="outline" className="rounded-full text-xs sm:text-sm">Score: {scores[primaryType]} ({getScoreLevel(scores[primaryType], 30)})</Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Score Cards */}
                <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 mb-8 sm:mb-12">
                    {(["D", "C", "A", "S"] as const).map((type, index) => (
                        <div key={type} className={`animate-fade-in-up stagger-${index + 1}`}>
                            <ScoreCard type={type} score={scores[type]} />
                        </div>
                    ))}
                </div>

                {/* Charts */}
                <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 mb-8 sm:mb-12">
                    <Card className="border-0 shadow-xl animate-fade-in-up">
                        <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <CardTitle className="text-lg sm:text-xl">Score Visualization</CardTitle>
                                <div className="flex gap-2">
                                    <Button variant={chartType === "bar" ? "default" : "outline"} size="sm" onClick={() => setChartType("bar")} className="rounded-full text-xs sm:text-sm btn-press">Bar</Button>
                                    <Button variant={chartType === "radar" ? "default" : "outline"} size="sm" onClick={() => setChartType("radar")} className="rounded-full text-xs sm:text-sm btn-press">Radar</Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="px-2 sm:px-6 pb-4 sm:pb-6">
                            <div className="w-full overflow-x-auto">
                                {chartType === "bar" ? <DCASBarChart scores={scores} /> : <DCASRadarChart scores={scores} />}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-xl animate-fade-in-up stagger-1">
                        <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
                            <CardTitle className="text-lg sm:text-xl">Detailed Score Breakdown</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">Your scores across all DCAS dimensions</CardDescription>
                        </CardHeader>
                        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                            <div className="space-y-3 sm:space-y-4">
                                {rankedTypes.map((type, index) => {
                                    const level = getScoreLevel(scores[type], 30)
                                    const percentage = (scores[type] / 30) * 100
                                    return (
                                        <div key={type} className="space-y-1.5 sm:space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-xs sm:text-sm font-bold text-white" style={{ backgroundColor: dcasColors[type].primary }}>{type}</div>
                                                    <div>
                                                        <span className="font-medium text-slate-900 dark:text-white text-sm sm:text-base">{defaultDCASNames[type]}</span>
                                                        {index === 0 && <Badge className="ml-2 text-xs hidden sm:inline-flex" variant="outline">Primary</Badge>}
                                                        {index === 1 && <Badge className="ml-2 text-xs hidden sm:inline-flex" variant="outline">Secondary</Badge>}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{scores[type]}</span>
                                                    <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400"> / 30</span>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">{level}</p>
                                                </div>
                                            </div>
                                            <div className="h-1.5 sm:h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                                <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${percentage}%`, backgroundColor: dcasColors[type].primary }} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Career Recommendations */}
                <div className="mb-8 sm:mb-12">
                    <div className="text-center mb-6 sm:mb-8">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">Top Career Matches</h2>
                        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 px-2">Based on your DCAS profile, here are careers that align with your natural tendencies</p>
                    </div>
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
                        {careers.map((career, index) => (
                            <Card key={index} className={`border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 card-hover animate-fade-in-up stagger-${index + 1}`}>
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                                        <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl text-xl sm:text-2xl shadow-lg" style={{ backgroundColor: dcasColors[career.source === "primary" ? primaryType : secondaryType].light }}>
                                            {career.icon}
                                        </div>
                                        <Badge className="rounded-full text-xs" style={{ backgroundColor: dcasColors[career.source === "primary" ? primaryType : secondaryType].light, color: dcasColors[career.source === "primary" ? primaryType : secondaryType].primary }}>
                                            #{index + 1} Match
                                        </Badge>
                                    </div>
                                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">{career.title}</h3>
                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3 sm:mb-4">{career.description}</p>
                                    <div className="flex flex-wrap gap-1 sm:gap-2">
                                        {career.skills.slice(0, 3).map((skill, skillIndex) => (
                                            <Badge key={skillIndex} variant="outline" className="rounded-full text-xs">{skill}</Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Behavioural Summary */}
                <Card className="border-0 shadow-xl mb-8 sm:mb-12 animate-fade-in-up">
                    <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
                        <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                            <span className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl text-base sm:text-lg font-bold text-white" style={{ backgroundColor: dcasColors[primaryType].primary }}>{primaryType}</span>
                            Behavioural Summary
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Understanding your {defaultDCASNames[primaryType]} profile</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
                        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">{profileDesc}</p>
                        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                            <div>
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                                    <span className="text-emerald-500">✦</span> Core Strengths
                                </h4>
                                <ul className="space-y-1.5 sm:space-y-2">
                                    {primaryInterp.strengths.slice(0, 4).map((s, i) => (
                                        <li key={i} className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />{s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                                    <span className="text-amber-500">✦</span> Development Areas
                                </h4>
                                <ul className="space-y-1.5 sm:space-y-2">
                                    {primaryInterp.developmentAreas.slice(0, 4).map((a, i) => (
                                        <li key={i} className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />{a}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* CTA */}
                <div className="text-center">
                    <Card className="border-0 bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-2xl animate-fade-in-up">
                        <CardContent className="p-6 sm:p-8">
                            <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Want to Retake?</h3>
                            <p className="text-indigo-100 mb-4 sm:mb-6 max-w-2xl mx-auto text-sm sm:text-base px-2">
                                You can retake the assessment at any time to see how your behavioral profile may evolve.
                            </p>
                            <Link href="/assessment">
                                <Button size="lg" className="rounded-full bg-white text-indigo-600 hover:bg-indigo-50 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold shadow-lg btn-press">
                                    Retake Assessment <span className="ml-2">→</span>
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <footer className="relative z-10 border-t border-slate-200 dark:border-slate-800 py-6 sm:py-8 mt-8 sm:mt-12 safe-area-inset">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                        © {new Date().getFullYear()} DCAS Behavioural Assessment. Results are for guidance purposes only.
                    </p>
                </div>
            </footer>
        </div>
    )
}
