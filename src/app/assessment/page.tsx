"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { dcasQuestions } from "@/lib/data/questions"
import { DCASType, calculateScores, getRankedTypes, dcasColors, defaultDCASNames } from "@/lib/dcas/scoring"
import { AuthGate } from "@/components/auth-gate"
import { ModeToggle } from "@/components/theme-toggle"

export default function AssessmentPage() {
    const [userId, setUserId] = useState<string | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    const handleAuthenticated = (uid: string) => {
        setUserId(uid)
        setIsAuthenticated(true)
    }

    if (!isAuthenticated) {
        return <AuthGate onAuthenticated={handleAuthenticated} />
    }

    return <AssessmentContent userId={userId} />
}

function AssessmentContent({ userId }: { userId: string | null }) {
    const router = useRouter()
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [answers, setAnswers] = useState<Record<number, DCASType>>({})
    const [selectedOption, setSelectedOption] = useState<string>("")
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [showIncompleteWarning, setShowIncompleteWarning] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const question = dcasQuestions[currentQuestion]
    const totalQuestions = dcasQuestions.length
    const answeredCount = Object.keys(answers).length
    const progress = (answeredCount / totalQuestions) * 100
    const displayAnsweredCount = answeredCount + (selectedOption && !answers[question.id] ? 1 : 0)

    useEffect(() => {
        if (answers[question.id]) {
            setSelectedOption(answers[question.id])
        } else {
            setSelectedOption("")
        }
    }, [currentQuestion, answers, question.id])

    const handleOptionSelect = (value: string) => {
        setSelectedOption(value)
        setAnswers(prev => ({ ...prev, [question.id]: value as DCASType }))
    }

    const handleNext = () => {
        if (!selectedOption) return

        setIsAnimating(true)
        setTimeout(() => {
            if (currentQuestion < totalQuestions - 1) {
                setCurrentQuestion(prev => prev + 1)
            } else {
                const currentAnswers = { ...answers, [question.id]: selectedOption as DCASType }
                const allAnswered = Object.keys(currentAnswers).length === totalQuestions
                if (allAnswered) {
                    setShowConfirmation(true)
                } else {
                    setShowIncompleteWarning(true)
                }
            }
            setIsAnimating(false)
        }, 200)
    }

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setIsAnimating(true)
            setTimeout(() => {
                setCurrentQuestion(prev => prev - 1)
                setIsAnimating(false)
            }, 200)
        }
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        const finalAnswers = { ...answers, [question.id]: selectedOption as DCASType }
        const scores = calculateScores(finalAnswers)
        const rankedTypes = getRankedTypes(scores)

        try {
            // Save session to MongoDB
            const res = await fetch("/api/sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: userId,
                    responses: Object.entries(finalAnswers).map(([qId, type]) => {
                        const qNum = parseInt(qId)
                        const questionObj = dcasQuestions.find(q => q.id === qNum)
                        // Find the option key that corresponds to the selected DCASType
                        // Note: options is an object { A: {...}, B: {...} ... }
                        // We need to find which one has type === type
                        let label = ""
                        if (questionObj) {
                            const option = Object.values(questionObj.options).find(opt => opt.type === type)
                            if (option) label = option.text
                        }

                        return {
                            question_id: qNum,
                            selected_option: type,
                            dcas_type: type,
                            selected_option_label: label,
                        }
                    }),
                    score: {
                        raw: scores,
                        percent: {
                            D: Math.round((scores.D / totalQuestions) * 100),
                            C: Math.round((scores.C / totalQuestions) * 100),
                            A: Math.round((scores.A / totalQuestions) * 100),
                            S: Math.round((scores.S / totalQuestions) * 100),
                        },
                        primary: rankedTypes[0],
                        secondary: rankedTypes[1],
                    },
                }),
            })

            let sessionId;
            if (res.ok) {
                const data = await res.json()
                sessionId = data.sessionId;

                // Trigger Email Report
                if (sessionId) {
                    fetch("/api/email/report", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ sessionId })
                    }).catch(err => console.error("Email failed:", err)); // Non-blocking
                }

                router.push(`/results/${data.sessionId}`)
            } else {
                // Fallback: use sessionStorage
                sessionStorage.setItem("dcasScores", JSON.stringify(scores))
                sessionStorage.setItem("dcasRankedTypes", JSON.stringify(rankedTypes))
                sessionStorage.setItem("dcasAnswers", JSON.stringify(finalAnswers))
                router.push("/results/local")
            }
        } catch {
            // Fallback: use sessionStorage
            sessionStorage.setItem("dcasScores", JSON.stringify(scores))
            sessionStorage.setItem("dcasRankedTypes", JSON.stringify(rankedTypes))
            sessionStorage.setItem("dcasAnswers", JSON.stringify(finalAnswers))
            router.push("/results/local")
        } finally {
            setIsSubmitting(false)
        }
    }

    const canProceed = selectedOption !== ""
    const isLastQuestion = currentQuestion === totalQuestions - 1

    const optionKeys = ["A", "B", "C", "D"] as const

    if (showConfirmation) {
        return (
            <div className="min-h-dvh bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4 safe-area-inset">
                <Card className="max-w-md w-full border-0 shadow-2xl animate-scale-in">
                    <CardContent className="p-6 sm:p-8 text-center">
                        <div className="mb-5 sm:mb-6 mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 text-3xl sm:text-4xl shadow-lg shadow-emerald-500/30 animate-float">
                            ✓
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
                            Assessment Complete!
                        </h2>
                        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-6 sm:mb-8">
                            You&apos;ve answered all 30 questions. Ready to discover your DCAS personality profile?
                        </p>
                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full rounded-full bg-linear-to-r from-indigo-600 to-purple-600 py-5 sm:py-6 text-base sm:text-lg font-semibold shadow-lg btn-press"
                            >
                                {isSubmitting ? "Saving..." : "View My Results"}
                            </Button>
                            <Button variant="ghost" onClick={() => setShowConfirmation(false)} className="w-full py-3">
                                Review Answers
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (showIncompleteWarning) {
        const unansweredCount = totalQuestions - Object.keys({ ...answers, ...(selectedOption ? { [question.id]: selectedOption } : {}) }).length

        return (
            <div className="min-h-dvh bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4 safe-area-inset">
                <Card className="max-w-md w-full border-0 shadow-2xl animate-scale-in">
                    <CardContent className="p-6 sm:p-8 text-center">
                        <div className="mb-5 sm:mb-6 mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-linear-to-br from-amber-400 to-orange-500 text-3xl sm:text-4xl shadow-lg shadow-amber-500/30 animate-float">
                            ⚠️
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
                            Questions Incomplete
                        </h2>
                        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4">
                            You have <span className="font-bold text-amber-600">{unansweredCount}</span> unanswered question{unansweredCount !== 1 ? "s" : ""}. Please complete all questions to get accurate results.
                        </p>
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 mb-6">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Unanswered questions:</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {dcasQuestions.map((q, idx) => {
                                    const isAnswered = answers[q.id] || (q.id === question.id && selectedOption)
                                    if (isAnswered) return null
                                    return (
                                        <button
                                            key={q.id}
                                            onClick={() => { setCurrentQuestion(idx); setShowIncompleteWarning(false) }}
                                            className="h-8 w-8 rounded-lg text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                                        >
                                            {idx + 1}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={() => {
                                    const firstUnanswered = dcasQuestions.findIndex(q => !answers[q.id] && (q.id !== question.id || !selectedOption))
                                    if (firstUnanswered !== -1) setCurrentQuestion(firstUnanswered)
                                    setShowIncompleteWarning(false)
                                }}
                                className="w-full rounded-full bg-linear-to-r from-indigo-600 to-purple-600 py-5 sm:py-6 text-base sm:text-lg font-semibold shadow-lg btn-press"
                            >
                                Complete Remaining Questions
                            </Button>
                            <Button variant="ghost" onClick={() => setShowIncompleteWarning(false)} className="w-full py-3">
                                Go Back
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-dvh bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 h-40 w-40 sm:h-80 sm:w-80 rounded-full bg-linear-to-br from-indigo-500/10 to-purple-500/10 blur-3xl" />
                <div className="absolute bottom-0 -left-20 sm:-left-40 h-40 w-40 sm:h-80 sm:w-80 rounded-full bg-linear-to-br from-emerald-500/10 to-teal-500/10 blur-3xl" />
            </div>

            <header className="z-10 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg sticky top-0">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 text-xs sm:text-sm font-bold text-white">D</div>
                            <span className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base hidden sm:inline">DCAS Assessment</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <ModeToggle />
                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-1.5">
                                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                                <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{displayAnsweredCount}</span>
                                    <span className="text-slate-400 dark:text-slate-500"> / {totalQuestions}</span>
                                </span>
                            </div>
                            <Link href="/" className="sm:hidden">
                                <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0">✕</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 pt-4 sm:pt-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                        Question {currentQuestion + 1} of {totalQuestions}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        {Math.round((displayAnsweredCount / totalQuestions) * 100)}% Answered
                    </span>
                </div>
                <Progress
                    value={(displayAnsweredCount / totalQuestions) * 100}
                    className="h-1.5 sm:h-2 bg-slate-200 dark:bg-slate-800"
                    indicatorClassName="bg-linear-to-r from-indigo-500 to-purple-500"
                />
            </div>

            <main className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8">
                <Card className={`border-0 shadow-xl transition-all duration-300 ${isAnimating ? "opacity-0 transform translate-y-4" : "opacity-100 transform translate-y-0"}`}>
                    <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 text-xs sm:text-sm font-bold text-white shadow-lg">
                                {currentQuestion + 1}
                            </div>
                            <div className="flex gap-1">
                                {(["D", "C", "A", "S"] as const).map((type) => (
                                    <div key={type} className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full" style={{ backgroundColor: dcasColors[type].primary, opacity: 0.3 }} />
                                ))}
                            </div>
                        </div>
                        <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                            {question.question}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                        <RadioGroup value={selectedOption} onValueChange={handleOptionSelect} className="space-y-2 sm:space-y-3">
                            {optionKeys.map((key, index) => {
                                const option = question.options[key]
                                return (
                                    <RadioGroupItem
                                        key={key}
                                        value={option.type}
                                        className={`transition-all duration-200 p-3 sm:p-4 ${selectedOption === option.type ? "ring-2 ring-offset-2 ring-offset-background" : ""}`}
                                        style={{
                                            borderColor: selectedOption === option.type ? dcasColors[option.type].primary : undefined,
                                            backgroundColor: selectedOption === option.type ? `${dcasColors[option.type].light}50` : undefined,
                                        }}
                                    >
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <span
                                                className="font-semibold text-xs sm:text-sm px-1.5 sm:px-2 py-0.5 rounded shrink-0"
                                                style={{ backgroundColor: dcasColors[option.type].light, color: dcasColors[option.type].primary }}
                                            >
                                                {String.fromCharCode(65 + index)}
                                            </span>
                                            <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300">{option.text}</span>
                                        </div>
                                    </RadioGroupItem>
                                )
                            })}
                        </RadioGroup>

                        <div className="flex justify-between items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-800">
                            <Button variant="ghost" onClick={handlePrevious} disabled={currentQuestion === 0} className="gap-1 sm:gap-2 text-sm sm:text-base px-3 sm:px-4 btn-press">
                                <span>←</span>
                                <span className="hidden sm:inline">Previous</span>
                            </Button>
                            <div className="sm:hidden text-xs text-slate-500 dark:text-slate-400">{currentQuestion + 1}/{totalQuestions}</div>
                            <div className="hidden sm:flex gap-1">
                                {dcasQuestions.slice(Math.max(0, currentQuestion - 2), Math.min(totalQuestions, currentQuestion + 3)).map((_, idx) => {
                                    const actualIdx = Math.max(0, currentQuestion - 2) + idx
                                    return (
                                        <div
                                            key={actualIdx}
                                            className={`h-2 w-2 rounded-full transition-all ${actualIdx === currentQuestion ? "bg-indigo-600 w-6" : answers[actualIdx + 1] ? "bg-emerald-400" : "bg-slate-300 dark:bg-slate-700"}`}
                                        />
                                    )
                                })}
                            </div>
                            <Button
                                onClick={handleNext}
                                disabled={!canProceed}
                                className="gap-1 sm:gap-2 bg-linear-to-r from-indigo-600 to-purple-600 shadow-lg disabled:opacity-50 text-sm sm:text-base px-4 sm:px-6 btn-press"
                            >
                                <span className="hidden sm:inline">{isLastQuestion ? "Complete" : "Next"}</span>
                                <span className="sm:hidden">{isLastQuestion ? "Done" : "Next"}</span>
                                <span>→</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-4 sm:mt-6 text-center">
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 px-2">
                        💡 Choose the option that best describes your natural tendency
                    </p>
                </div>

                <div className="mt-6 sm:mt-8">
                    <details className="group">
                        <summary className="cursor-pointer text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                            <span>Question Navigator</span>
                            <span className="group-open:rotate-180 transition-transform text-xs">▼</span>
                        </summary>
                        <div className="mt-3 sm:mt-4 grid grid-cols-6 sm:grid-cols-10 gap-1.5 sm:gap-2">
                            {dcasQuestions.map((q, idx) => (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentQuestion(idx)}
                                    className={`h-8 w-full sm:h-8 sm:w-8 rounded-lg text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${idx === currentQuestion
                                        ? "bg-indigo-600 text-white shadow-lg"
                                        : answers[q.id]
                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                    </details>
                </div>
            </main>
        </div>
    )
}
