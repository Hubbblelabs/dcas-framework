"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DCASBarChart } from "@/components/charts/dcas-charts"
import { DCASScores, DCASType, dcasColors, defaultDCASNames, getScoreLevel } from "@/lib/dcas/scoring"
import { interpretations, getCombinedProfileDescription } from "@/lib/dcas/interpretations"
import { getCareerRecommendations, careersByType } from "@/lib/dcas/careers"
import { ModeToggle } from "@/components/theme-toggle"

export default function ReportPage() {
    const router = useRouter()
    const params = useParams()
    const sessionId = params.id as string
    const reportRef = useRef<HTMLDivElement>(null)
    const [scores, setScores] = useState<DCASScores | null>(null)
    const [rankedTypes, setRankedTypes] = useState<DCASType[]>([])
    const [isLoaded, setIsLoaded] = useState(false)
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

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

    const handleDownloadPdf = async () => {
        if (!reportRef.current) return
        setIsGeneratingPdf(true)
        try {
            const html2canvas = (await import("html2canvas")).default
            const { jsPDF } = await import("jspdf")
            const noPrintElements = document.querySelectorAll(".no-print")
            noPrintElements.forEach((el) => ((el as HTMLElement).style.display = "none"))
            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
            })
            noPrintElements.forEach((el) => ((el as HTMLElement).style.display = ""))
            const imgData = canvas.toDataURL("image/png")
            const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = pdf.internal.pageSize.getHeight()
            const scaledImgHeight = (canvas.height * pdfWidth) / canvas.width
            let heightLeft = scaledImgHeight
            let position = 0
            pdf.addImage(imgData, "PNG", 0, position, pdfWidth, scaledImgHeight)
            heightLeft -= pdfHeight
            while (heightLeft > 0) {
                position = heightLeft - scaledImgHeight
                pdf.addPage()
                pdf.addImage(imgData, "PNG", 0, position, pdfWidth, scaledImgHeight)
                heightLeft -= pdfHeight
            }
            const date = new Date().toISOString().split("T")[0]
            pdf.save(`DCAS-Behavioural-Report-${date}.pdf`)
        } catch (error) {
            console.error("Error generating PDF:", error)
            window.print()
        } finally {
            setIsGeneratingPdf(false)
        }
    }

    if (!isLoaded || !scores) {
        return (
            <div className="min-h-screen min-h-dvh flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <div className="text-center px-4">
                    <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Loading your report...</p>
                </div>
            </div>
        )
    }

    const primaryType = rankedTypes[0]
    const secondaryType = rankedTypes[1]
    const tertiaryType = rankedTypes[2]
    const primaryInterp = interpretations[primaryType]
    const secondaryInterp = interpretations[secondaryType]
    const profileDesc = getCombinedProfileDescription(primaryType, secondaryType)
    const careers = getCareerRecommendations(primaryType, secondaryType)

    const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    })

    return (
        <>
            <style jsx global>{`
                @media print {
                    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    .no-print { display: none !important; }
                    .print-break { page-break-before: always; }
                }
            `}</style>

            <div className="min-h-screen min-h-dvh bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <header className="no-print relative z-10 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg sticky top-0">
                    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center justify-between">
                            <Link href="/" className="flex items-center gap-2">
                                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-xs sm:text-sm font-bold text-white">D</div>
                                <span className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base hidden sm:inline">DCAS Assessment</span>
                            </Link>
                            <div className="flex items-center gap-2 sm:gap-3">
                                <ModeToggle />
                                <Button variant="outline" className="rounded-full gap-1.5 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 btn-press border-indigo-200 dark:border-indigo-800" onClick={handleDownloadPdf} disabled={isGeneratingPdf}>
                                    {isGeneratingPdf ? (<><span className="animate-spin">⏳</span><span className="hidden sm:inline">Generating...</span><span className="sm:hidden">Wait</span></>) : (<><span>📥</span><span className="hidden sm:inline">Download PDF</span><span className="sm:hidden">PDF</span></>)}
                                </Button>
                                <Link href={`/results/${sessionId}`}>
                                    <Button variant="ghost" className="rounded-full text-xs sm:text-sm btn-press gap-1"><span>←</span><span className="hidden sm:inline">Results</span><span className="sm:hidden">Back</span></Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>

                <div ref={reportRef} className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
                    {/* Report Header */}
                    <div className="text-center mb-8 sm:mb-12 pb-6 sm:pb-8 border-b border-slate-200 dark:border-slate-800 animate-fade-in">
                        <div className="inline-flex items-center justify-center gap-3 mb-4 sm:mb-6">
                            <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-xl sm:text-2xl font-bold text-white shadow-lg">D</div>
                        </div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">DCAS Behavioural Assessment Report</h1>
                        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Comprehensive Behavioural Analysis & Career Guidance</p>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-3 sm:mt-4">Generated on {currentDate}</p>
                    </div>

                    {/* 1. Profile Overview */}
                    <section className="mb-8 sm:mb-12 animate-fade-in-up">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                            <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm sm:text-base">1</span>
                            Profile Overview
                        </h2>
                        <Card className="border-0 shadow-xl overflow-hidden">
                            <div className="h-1.5 sm:h-2" style={{ background: `linear-gradient(to right, ${dcasColors[primaryType].primary}, ${dcasColors[secondaryType].primary}, ${dcasColors[tertiaryType].primary})` }} />
                            <CardContent className="p-4 sm:p-6 lg:p-8">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                                    {[
                                        { type: primaryType, label: "Primary Type" },
                                        { type: secondaryType, label: "Secondary Type" },
                                        { type: tertiaryType, label: "Tertiary Type" },
                                    ].map(({ type, label }) => (
                                        <div key={type + label} className="text-center">
                                            <div className="mx-auto mb-3 sm:mb-4 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl text-2xl sm:text-3xl font-bold text-white shadow-lg" style={{ backgroundColor: dcasColors[type].primary }}>{type}</div>
                                            <Badge className="mb-2 text-xs" style={{ backgroundColor: dcasColors[type].light, color: dcasColors[type].primary }}>{label}</Badge>
                                            <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{defaultDCASNames[type]}</h3>
                                            <p className="text-lg sm:text-2xl font-bold" style={{ color: dcasColors[type].primary }}>{scores[type]} / 30</p>
                                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{getScoreLevel(scores[type], 30)}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* 2. Score Visualization */}
                    <section className="mb-8 sm:mb-12 animate-fade-in-up stagger-1">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                            <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm sm:text-base">2</span>
                            Score Visualization
                        </h2>
                        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                            <Card className="border-0 shadow-xl">
                                <CardHeader className="px-4 sm:px-6 py-4">
                                    <CardTitle className="text-base sm:text-lg">DCAS Score Distribution</CardTitle>
                                </CardHeader>
                                <CardContent className="px-2 sm:px-6 pb-4 sm:pb-6">
                                    <div className="w-full overflow-x-auto"><DCASBarChart scores={scores} /></div>
                                </CardContent>
                            </Card>
                            <Card className="border-0 shadow-xl">
                                <CardHeader className="px-4 sm:px-6 py-4">
                                    <CardTitle className="text-base sm:text-lg">Score Breakdown</CardTitle>
                                </CardHeader>
                                <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[320px]">
                                            <thead>
                                                <tr className="border-b border-slate-200 dark:border-slate-800">
                                                    <th className="text-left py-2 sm:py-3 font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">Type</th>
                                                    <th className="text-center py-2 sm:py-3 font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">Score</th>
                                                    <th className="text-center py-2 sm:py-3 font-semibold text-slate-900 dark:text-white text-xs sm:text-sm hidden sm:table-cell">Level</th>
                                                    <th className="text-right py-2 sm:py-3 font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">Rank</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rankedTypes.map((type, index) => (
                                                    <tr key={type} className="border-b border-slate-100 dark:border-slate-800">
                                                        <td className="py-2 sm:py-3">
                                                            <div className="flex items-center gap-2 sm:gap-3">
                                                                <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm" style={{ backgroundColor: dcasColors[type].primary }}>{type}</div>
                                                                <span className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm">{defaultDCASNames[type]}</span>
                                                            </div>
                                                        </td>
                                                        <td className="text-center py-2 sm:py-3 font-bold text-xs sm:text-sm" style={{ color: dcasColors[type].primary }}>{scores[type]} / 30</td>
                                                        <td className="text-center py-2 sm:py-3 hidden sm:table-cell"><Badge variant="outline" className="text-xs">{getScoreLevel(scores[type], 30)}</Badge></td>
                                                        <td className="text-right py-2 sm:py-3 text-slate-500 dark:text-slate-400 text-xs sm:text-sm">#{index + 1}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* 3. Personality Description */}
                    <section className="mb-8 sm:mb-12 print-break animate-fade-in-up stagger-2">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                            <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm sm:text-base">3</span>
                            Personality Description
                        </h2>
                        <Card className="border-0 shadow-xl">
                            <CardContent className="p-4 sm:p-6 lg:p-8">
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                                    <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl text-2xl sm:text-3xl font-bold text-white shrink-0" style={{ backgroundColor: dcasColors[primaryType].primary }}>{primaryType}</div>
                                    <div className="text-center sm:text-left">
                                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{defaultDCASNames[primaryType]}</h3>
                                        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">{primaryInterp.traits.join(" · ")}</p>
                                    </div>
                                </div>
                                <p className="text-sm sm:text-base lg:text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-6 sm:mb-8">{profileDesc}</p>
                                <div className="grid gap-6 sm:gap-8 sm:grid-cols-2">
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base"><span className="text-emerald-500 text-lg sm:text-xl">💪</span> Core Strengths</h4>
                                        <ul className="space-y-2 sm:space-y-3">
                                            {primaryInterp.strengths.map((s, i) => (
                                                <li key={i} className="flex items-start gap-2 sm:gap-3"><div className="mt-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 shrink-0" /><span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{s}</span></li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base"><span className="text-blue-500 text-lg sm:text-xl">🎯</span> Key Traits</h4>
                                        <ul className="space-y-2 sm:space-y-3">
                                            {primaryInterp.traits.map((t, i) => (
                                                <li key={i} className="flex items-start gap-2 sm:gap-3"><div className="mt-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-500 shrink-0" /><span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{t}</span></li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* 4. Communication & Stress */}
                    <section className="mb-8 sm:mb-12">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                            <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm sm:text-base">4</span>
                            Communication & Stress Patterns
                        </h2>
                        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                            <Card className="border-0 shadow-xl">
                                <CardHeader className="px-4 sm:px-6 py-4"><CardTitle className="flex items-center gap-2 text-sm sm:text-base"><span className="text-lg sm:text-xl">💬</span> Communication Style</CardTitle></CardHeader>
                                <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6"><p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{primaryInterp.communicationStyle}</p></CardContent>
                            </Card>
                            <Card className="border-0 shadow-xl">
                                <CardHeader className="px-4 sm:px-6 py-4"><CardTitle className="flex items-center gap-2 text-sm sm:text-base"><span className="text-lg sm:text-xl">⚠️</span> Stress Response</CardTitle></CardHeader>
                                <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6"><p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{primaryInterp.stressResponse}</p></CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* 5. Development Areas */}
                    <section className="mb-8 sm:mb-12">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                            <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm sm:text-base">5</span>
                            Development Areas
                        </h2>
                        <Card className="border-0 shadow-xl">
                            <CardContent className="p-4 sm:p-6 lg:p-8">
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 sm:mb-6">
                                    While your DCAS profile highlights many strengths, focusing on these development areas will help you become more well-rounded and effective.
                                </p>
                                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                                    {primaryInterp.developmentAreas.map((area, index) => (
                                        <div key={index} className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                                            <span className="text-amber-500 text-base sm:text-lg shrink-0">📌</span>
                                            <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">{area}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* 6. Career Recommendations */}
                    <section className="mb-8 sm:mb-12 print-break">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                            <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm sm:text-base">6</span>
                            Career Recommendations
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 sm:mb-6">
                            Based on your DCAS profile, the following careers align with your natural behavioural tendencies.
                        </p>
                        {rankedTypes.slice(0, 3).map((type, typeIndex) => (
                            <div key={type} className="mb-6 sm:mb-8">
                                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm" style={{ backgroundColor: dcasColors[type].primary }}>{type}</div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                                        {defaultDCASNames[type]} Careers
                                        <span className="ml-2 text-xs sm:text-sm font-normal text-slate-500 dark:text-slate-400">({typeIndex === 0 ? "Primary" : typeIndex === 1 ? "Secondary" : "Tertiary"})</span>
                                    </h3>
                                </div>
                                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                    {(careersByType[type] || []).slice(0, 3).map((career, index) => (
                                        <Card key={index} className="border shadow-sm">
                                            <CardContent className="p-3 sm:p-5">
                                                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                                    <span className="text-xl sm:text-2xl">{career.icon}</span>
                                                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">{career.title}</h4>
                                                </div>
                                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-2 sm:mb-3">{career.description}</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {career.skills.map((skill, si) => (<Badge key={si} variant="outline" className="text-xs">{skill}</Badge>))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </section>

                    {/* 7. Action Plan */}
                    <section className="mb-8 sm:mb-12">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                            <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm sm:text-base">7</span>
                            Action Plan for Growth
                        </h2>
                        <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
                            <CardContent className="p-4 sm:p-6 lg:p-8">
                                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mb-4 sm:mb-6">
                                    Based on your {defaultDCASNames[primaryType]} profile, here&apos;s a personalized action plan to maximize your strengths and address development areas:
                                </p>
                                <div className="space-y-4 sm:space-y-6">
                                    {[
                                        { num: 1, color: "bg-emerald-500", title: "Leverage Your Strengths", desc: `Your ${defaultDCASNames[primaryType].toLowerCase()} trait is your superpower. Seek opportunities where ${primaryInterp.strengths[0]?.toLowerCase()} is valued.` },
                                        { num: 2, color: "bg-blue-500", title: "Build Complementary Skills", desc: `Focus on developing skills from your secondary type (${defaultDCASNames[secondaryType]}). This will make you more versatile in team settings and leadership roles.` },
                                        { num: 3, color: "bg-amber-500", title: "Address Development Areas", desc: `Start with: "${primaryInterp.developmentAreas[0]}". Set specific goals and seek feedback from mentors or peers.` },
                                        { num: 4, color: "bg-purple-500", title: "Explore Career Paths", desc: "Research the recommended careers above. Connect with professionals in these fields through networking or informational interviews." },
                                        { num: 5, color: "bg-pink-500", title: "Seek Ideal Environments", desc: `Look for work environments that suit: ${primaryInterp.workEnvironment}. This is where you'll naturally thrive.` },
                                    ].map((step) => (
                                        <div key={step.num} className="flex items-start gap-3 sm:gap-4">
                                            <div className={`flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl ${step.color} text-white font-bold text-sm sm:text-base`}>{step.num}</div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white mb-1 text-sm sm:text-base">{step.title}</h4>
                                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{step.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Footer */}
                    <div className="text-center pt-6 sm:pt-8 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-3 sm:mb-4 px-2">
                            This report is generated based on your DCAS assessment responses. Results are for career guidance purposes and should be used alongside other career exploration tools.
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">© {new Date().getFullYear()} DCAS Behavioural Assessment | Generated on {currentDate}</p>
                    </div>

                    {/* Print CTA */}
                    <div className="no-print mt-8 sm:mt-12 text-center safe-area-inset">
                        <Card className="border-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-2xl">
                            <CardContent className="p-6 sm:p-8">
                                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Save Your Report</h3>
                                <p className="text-indigo-100 mb-4 sm:mb-6 max-w-2xl mx-auto text-sm sm:text-base px-2">
                                    Download this comprehensive report as a PDF to share with career counselors, keep for future reference, or include in your career portfolio.
                                </p>
                                <Button size="lg" className="rounded-full bg-white text-indigo-600 hover:bg-indigo-50 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold shadow-lg btn-press gap-2" onClick={handleDownloadPdf} disabled={isGeneratingPdf}>
                                    {isGeneratingPdf ? (<><span className="animate-spin">⏳</span>Generating PDF...</>) : (<>📥 Download PDF</>)}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    )
}
