"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QuestionCard } from "@/components/assessment/QuestionCard";
import { ProgressBar } from "@/components/assessment/ProgressBar";
import { Button } from "@/components/ui/button";
import questionsData from "@/data/questions.json";
import { Question, Scores } from "@/types";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function AssessmentPage() {
    const router = useRouter();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [isClient, setIsClient] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setIsClient(true);
    }, []);

    const questions = questionsData as Question[];
    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;

    const handleOptionSelect = (optionLabel: string) => {
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: optionLabel,
        }));

        // Auto-advance after short delay for better UX? 
        // Or let user click Next. Let's let user click Next to be safe/intentional.
    };

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            window.scrollTo(0, 0);
        } else {
            calculateAndRedirect();
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    };

    const calculateAndRedirect = () => {
        const scores: Scores = { D: 0, C: 0, A: 0, S: 0 };

        questions.forEach((q) => {
            const selectedLabel = answers[q.id];
            if (selectedLabel) {
                const option = q.options.find((opt) => opt.label === selectedLabel);
                if (option && option.trait) {
                    scores[option.trait] += 1;
                }
            }
        });

        // Redirect with scores in query string
        const queryParams = new URLSearchParams({
            D: scores.D.toString(),
            C: scores.C.toString(),
            A: scores.A.toString(),
            S: scores.S.toString(),
        });

        router.push(`/results?${queryParams.toString()}`);
    };

    if (!isClient) return null; // Or loading spinner

    const isCurrentAnswered = !!answers[currentQuestion.id];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
            <div className="w-full max-w-2xl space-y-8">
                {/* Header / Progress */}
                <div className="space-y-4">
                    <ProgressBar current={currentQuestionIndex + 1} total={totalQuestions} />
                </div>

                {/* Question Card */}
                <QuestionCard
                    question={currentQuestion}
                    selectedOptionId={answers[currentQuestion.id] || null}
                    onSelectOption={handleOptionSelect}
                />

                {/* Navigation Actions */}
                <div className="flex justify-between items-center pt-4">
                    <Button
                        variant="ghost"
                        onClick={handlePrevious}
                        disabled={currentQuestionIndex === 0}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>

                    <Button
                        onClick={handleNext}
                        disabled={!isCurrentAnswered}
                        className="px-8 rounded-full shadow-md"
                    >
                        {currentQuestionIndex === totalQuestions - 1 ? "Finish Assessment" : "Next Question"}
                        {currentQuestionIndex !== totalQuestions - 1 && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}
