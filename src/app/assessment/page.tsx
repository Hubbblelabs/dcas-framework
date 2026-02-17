"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { dcasQuestions } from "@/lib/data/questions";
import {
  DCASType,
  calculateScores,
  getRankedTypes,
  defaultDCASNames,
} from "@/lib/dcas/scoring";
import { useDCASConfig } from "@/hooks/useDCASConfig";
import { AuthGate } from "@/components/auth-gate";
import { ModeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/Logo";
import {
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  X,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

export default function AssessmentPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuthenticated = (uid: string) => {
    setUserId(uid);
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <AuthGate onAuthenticated={handleAuthenticated} />;
  }

  return <AssessmentContent userId={userId} />;
}

function AssessmentContent({ userId }: { userId: string | null }) {
  const { dcasColors } = useDCASConfig();
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, DCASType>>({});
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState(dcasQuestions);

  const question = shuffledQuestions[currentQuestion];
  const totalQuestions = shuffledQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;
  const displayAnsweredCount =
    answeredCount + (selectedOption && !answers[question.id] ? 1 : 0);

  // Fetch settings from live template
  useEffect(() => {
    fetch("/api/assessment/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data?.shuffle_options) setShuffleOptions(true);
        if (data?.shuffle_questions) {
            setShuffleQuestions(true);
            // Simple random shuffle for questions
            const shuffled = [...dcasQuestions].sort(() => Math.random() - 0.5);
            setShuffledQuestions(shuffled);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (answers[question.id]) {
      setSelectedOption(answers[question.id]);
    } else {
      setSelectedOption("");
    }
  }, [currentQuestion, answers, question.id]);

  const handleOptionSelect = (value: string) => {
    setSelectedOption(value);
    setAnswers((prev) => ({ ...prev, [question.id]: value as DCASType }));
  };

  const handleNext = () => {
    if (!selectedOption) return;

    setIsAnimating(true);
    setTimeout(() => {
      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        const currentAnswers = {
          ...answers,
          [question.id]: selectedOption as DCASType,
        };
        const allAnswered =
          Object.keys(currentAnswers).length === totalQuestions;
        if (allAnswered) {
          setShowConfirmation(true);
        } else {
          setShowIncompleteWarning(true);
        }
      }
      setIsAnimating(false);
    }, 200);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentQuestion((prev) => prev - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const finalAnswers = {
      ...answers,
      [question.id]: selectedOption as DCASType,
    };
    const scores = calculateScores(finalAnswers);
    const rankedTypes = getRankedTypes(scores);

    try {
      // Save session to MongoDB
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          responses: Object.entries(finalAnswers).map(([qId, type]) => {
            const qNum = parseInt(qId);
            const questionObj = dcasQuestions.find((q) => q.id === qNum);
            // Find the option key that corresponds to the selected DCASType
            // Note: options is an object { A: {...}, B: {...} ... }
            // We need to find which one has type === type
            let label = "";
            if (questionObj) {
              const option = Object.values(questionObj.options).find(
                (opt) => opt.type === type,
              );
              if (option) label = option.text;
            }

            return {
              question_id: qNum,
              selected_option: type,
              dcas_type: type,
              selected_option_label: label,
            };
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
      });

      let sessionId;
      if (res.ok) {
        const data = await res.json();
        sessionId = data.sessionId;

        // Trigger Email Report
        if (sessionId) {
          fetch("/api/email/report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          }).catch((err) => console.error("Email failed:", err)); // Non-blocking
        }

        router.push(`/results/${data.sessionId}`);
      } else {
        // Fallback: use sessionStorage
        sessionStorage.setItem("dcasScores", JSON.stringify(scores));
        sessionStorage.setItem("dcasRankedTypes", JSON.stringify(rankedTypes));
        sessionStorage.setItem("dcasAnswers", JSON.stringify(finalAnswers));
        router.push("/results/local");
      }
    } catch {
      // Fallback: use sessionStorage
      sessionStorage.setItem("dcasScores", JSON.stringify(scores));
      sessionStorage.setItem("dcasRankedTypes", JSON.stringify(rankedTypes));
      sessionStorage.setItem("dcasAnswers", JSON.stringify(finalAnswers));
      router.push("/results/local");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = selectedOption !== "";
  const isLastQuestion = currentQuestion === totalQuestions - 1;

  // Seeded shuffle for stable per-question option ordering
  const getShuffledKeys = useCallback(
    (questionId: number): readonly ("A" | "B" | "C" | "D")[] => {
      const keys: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"];
      if (!shuffleOptions) return keys;
      // Simple seed from question id for deterministic shuffle
      let seed = questionId * 2654435761; // Knuth multiplicative hash
      for (let i = keys.length - 1; i > 0; i--) {
        seed = ((seed >>> 0) * 48271 + 1) >>> 0;
        const j = seed % (i + 1);
        [keys[i], keys[j]] = [keys[j], keys[i]];
      }
      return keys;
    },
    [shuffleOptions],
  );

  const optionKeys = useMemo(
    () => getShuffledKeys(question.id),
    [question.id, getShuffledKeys],
  );

  if (showConfirmation) {
    return (
      <div className="safe-area-inset flex min-h-dvh items-center justify-center bg-linear-to-br from-slate-50 via-white to-slate-100 px-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Card className="animate-scale-in w-full max-w-md border-0 shadow-2xl">
          <CardContent className="p-6 text-center sm:p-8">
            <div className="animate-float mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30 sm:mb-6 sm:h-20 sm:w-20">
              <CheckCircle className="h-8 w-8 text-white sm:h-10 sm:w-10" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-slate-900 sm:mb-3 sm:text-2xl dark:text-white">
              Assessment Complete!
            </h2>
            <p className="mb-6 text-sm text-slate-600 sm:mb-8 sm:text-base dark:text-slate-400">
              You&apos;ve answered all 30 questions. Ready to discover your DCAS
              behavioural profile?
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-press w-full rounded-full bg-linear-to-r from-indigo-600 to-purple-600 py-5 text-base font-semibold shadow-lg sm:py-6 sm:text-lg"
              >
                {isSubmitting ? "Saving..." : "View My Results"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowConfirmation(false)}
                className="w-full py-3"
              >
                Review Answers
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showIncompleteWarning) {
    const unansweredCount =
      totalQuestions -
      Object.keys({
        ...answers,
        ...(selectedOption ? { [question.id]: selectedOption } : {}),
      }).length;

    return (
      <div className="safe-area-inset flex min-h-dvh items-center justify-center bg-linear-to-br from-slate-50 via-white to-slate-100 px-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Card className="animate-scale-in w-full max-w-md border-0 shadow-2xl">
          <CardContent className="p-6 text-center sm:p-8">
            <div className="animate-float mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30 sm:mb-6 sm:h-20 sm:w-20">
              <AlertTriangle className="h-8 w-8 text-white sm:h-10 sm:w-10" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-slate-900 sm:mb-3 sm:text-2xl dark:text-white">
              Questions Incomplete
            </h2>
            <p className="mb-4 text-sm text-slate-600 sm:text-base dark:text-slate-400">
              You have{" "}
              <span className="font-bold text-amber-600">
                {unansweredCount}
              </span>{" "}
              unanswered question{unansweredCount !== 1 ? "s" : ""}. Please
              complete all questions to get accurate results.
            </p>
            <div className="mb-6 rounded-xl bg-slate-100 p-4 dark:bg-slate-800">
              <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                Unanswered questions:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {shuffledQuestions.map((q, idx) => {
                  const isAnswered =
                    answers[q.id] || (q.id === question.id && selectedOption);
                  if (isAnswered) return null;
                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentQuestion(idx);
                        setShowIncompleteWarning(false);
                      }}
                      className="h-8 w-8 rounded-lg bg-amber-100 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50"
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => {
                  const firstUnanswered = shuffledQuestions.findIndex(
                    (q) =>
                      !answers[q.id] &&
                      (q.id !== question.id || !selectedOption),
                  );
                  if (firstUnanswered !== -1)
                    setCurrentQuestion(firstUnanswered);
                  setShowIncompleteWarning(false);
                }}
                className="btn-press w-full rounded-full bg-linear-to-r from-indigo-600 to-purple-600 py-5 text-base font-semibold shadow-lg sm:py-6 sm:text-lg"
              >
                Complete Remaining Questions
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowIncompleteWarning(false)}
                className="w-full py-3"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-linear-to-br from-indigo-500/10 to-purple-500/10 blur-3xl sm:-top-40 sm:-right-40 sm:h-80 sm:w-80" />
        <div className="absolute bottom-0 -left-20 h-40 w-40 rounded-full bg-linear-to-br from-emerald-500/10 to-teal-500/10 blur-3xl sm:-left-40 sm:h-80 sm:w-80" />
      </div>

      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Logo size="sm" showText textClassName="hidden text-sm font-semibold text-slate-900 sm:inline sm:text-base dark:text-white" />
            </Link>
            <div className="flex items-center gap-2">
              <ModeToggle />
              <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-medium text-slate-700 sm:text-sm dark:text-slate-300">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {displayAnsweredCount}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500">
                    {" "}
                    / {totalQuestions}
                  </span>
                </span>
              </div>
              <Link href="/" className="sm:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-full p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-4xl px-4 pt-4 sm:px-6 sm:pt-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600 sm:text-sm dark:text-slate-400">
            Question {currentQuestion + 1} of {totalQuestions}
          </span>
          <span className="text-xs font-medium text-indigo-600 sm:text-sm dark:text-indigo-400">
            {Math.round((displayAnsweredCount / totalQuestions) * 100)}%
            Answered
          </span>
        </div>
        <Progress
          value={(displayAnsweredCount / totalQuestions) * 100}
          className="h-1.5 bg-slate-200 sm:h-2 dark:bg-slate-800"
          indicatorClassName="bg-linear-to-r from-indigo-500 to-purple-500"
        />
      </div>

      <main className="relative z-10 mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <Card
          className={`border-0 shadow-xl transition-all duration-300 ${isAnimating ? "translate-y-4 transform opacity-0" : "translate-y-0 transform opacity-100"}`}
        >
          <CardHeader className="px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-4">
            <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-lg sm:h-10 sm:w-10 sm:text-sm">
                {currentQuestion + 1}
              </div>
              <div className="flex gap-1">
                {(["D", "C", "A", "S"] as const).map((type) => (
                  <div
                    key={type}
                    className="h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2"
                    style={{
                      backgroundColor: dcasColors[type].primary,
                      opacity: 0.3,
                    }}
                  />
                ))}
              </div>
            </div>
            <CardTitle className="text-lg leading-tight font-bold text-slate-900 sm:text-xl md:text-2xl dark:text-white">
              {question.question}
            </CardTitle>
          </CardHeader>

          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
            <RadioGroup
              value={selectedOption}
              onValueChange={handleOptionSelect}
              className="space-y-2 sm:space-y-3"
            >
              {optionKeys.map((key, index) => {
                const option = question.options[key];
                return (
                  <RadioGroupItem
                    key={key}
                    value={option.type}
                    className={`p-3 transition-all duration-200 sm:p-4 ${selectedOption === option.type ? "ring-offset-background ring-2 ring-offset-2" : ""}`}
                    style={{
                      borderColor:
                        selectedOption === option.type ? "#6366f1" : undefined, // Indigo-500
                      backgroundColor:
                        selectedOption === option.type
                          ? "#e0e7ff50"
                          : undefined, // Indigo-100 with opacity
                    }}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-sm text-slate-700 sm:text-base dark:text-slate-300">
                        {option.text}
                      </span>
                    </div>
                  </RadioGroupItem>
                );
              })}
            </RadioGroup>

            <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 sm:mt-8 sm:pt-6 dark:border-slate-800">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="btn-press gap-1 px-3 text-sm sm:gap-2 sm:px-4 sm:text-base"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <div className="text-xs text-slate-500 sm:hidden dark:text-slate-400">
                {currentQuestion + 1}/{totalQuestions}
              </div>
              <div className="hidden gap-1 sm:flex">
                {shuffledQuestions
                  .slice(
                    Math.max(0, currentQuestion - 2),
                    Math.min(totalQuestions, currentQuestion + 3),
                  )
                  .map((_, idx) => {
                    const actualIdx = Math.max(0, currentQuestion - 2) + idx;
                    return (
                      <div
                        key={actualIdx}
                        className={`h-2 w-2 rounded-full transition-all ${actualIdx === currentQuestion ? "w-6 bg-indigo-600" : answers[actualIdx + 1] ? "bg-emerald-400" : "bg-slate-300 dark:bg-slate-700"}`}
                      />
                    );
                  })}
              </div>
              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className="btn-press gap-1 bg-linear-to-r from-indigo-600 to-purple-600 px-4 text-sm shadow-lg disabled:opacity-50 sm:gap-2 sm:px-6 sm:text-base"
              >
                <span className="hidden sm:inline">
                  {isLastQuestion ? "Complete" : "Next"}
                </span>
                <span className="sm:hidden">
                  {isLastQuestion ? "Done" : "Next"}
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 text-center sm:mt-6">
          <p className="flex items-center justify-center gap-2 px-2 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Choose the option that best describes your natural tendency
          </p>
        </div>

        <div className="mt-6 sm:mt-8">
          <details className="group">
            <summary className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600 sm:text-sm dark:text-slate-400">
              <span>Question Navigator</span>
              <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-3 grid grid-cols-6 gap-1.5 sm:mt-4 sm:grid-cols-10 sm:gap-2">
              {shuffledQuestions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestion(idx)}
                  className={`h-8 w-full rounded-lg text-xs font-medium transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none sm:h-8 sm:w-8 ${
                    idx === currentQuestion
                      ? "bg-indigo-600 text-white shadow-lg"
                      : answers[q.id]
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
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
  );
}
