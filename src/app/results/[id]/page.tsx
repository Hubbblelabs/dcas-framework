"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DCASBarChart,
  DCASRadarChart,
  ScoreCard,
} from "@/components/charts/dcas-charts";
import {
  DCASScores,
  DCASType,
  dcasColors,
  defaultDCASNames,
  getScoreLevel,
} from "@/lib/dcas/scoring";
import {
  interpretations,
  getCombinedProfileDescription,
} from "@/lib/dcas/interpretations";
import { getCareerRecommendations } from "@/lib/dcas/careers";
import { ModeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/Logo";
import { CareerIcon } from "@/components/career-icon";
import { Download, ArrowRight, Sparkles } from "lucide-react";

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;
  const [scores, setScores] = useState<DCASScores | null>(null);
  const [rankedTypes, setRankedTypes] = useState<DCASType[]>([]);
  const [chartType, setChartType] = useState<"bar" | "radar">("bar");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (sessionId === "local") {
      const storedScores = sessionStorage.getItem("dcasScores");
      const storedRankedTypes = sessionStorage.getItem("dcasRankedTypes");
      if (storedScores && storedRankedTypes) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setScores(JSON.parse(storedScores));
        setRankedTypes(JSON.parse(storedRankedTypes));
        setIsLoaded(true);
      } else {
        router.push("/assessment");
      }
    } else {
      fetch(`/api/sessions/${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.session?.score) {
            setScores(data.session.score.raw);
            const ranked: DCASType[] = [];
            if (data.session.score.primary)
              ranked.push(data.session.score.primary);
            if (data.session.score.secondary)
              ranked.push(data.session.score.secondary);
            const types: DCASType[] = ["D", "C", "A", "S"];
            types.sort(
              (a, b) =>
                (data.session.score.raw[b] || 0) -
                (data.session.score.raw[a] || 0),
            );
            const fullRanked = [
              ...new Set([...ranked, ...types]),
            ] as DCASType[];
            setRankedTypes(fullRanked);
            setIsLoaded(true);
          } else {
            router.push("/assessment");
          }
        })
        .catch(() => router.push("/assessment"));
    }
  }, [sessionId, router]);

  if (!isLoaded || !scores) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="px-4 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-indigo-600 sm:h-12 sm:w-12"></div>
          <p className="text-sm text-slate-600 sm:text-base dark:text-slate-400">
            Loading your results...
          </p>
        </div>
      </div>
    );
  }

  const primaryType = rankedTypes[0];
  const secondaryType = rankedTypes[1];
  const primaryInterp = interpretations[primaryType];
  const careers = getCareerRecommendations(primaryType, secondaryType);
  const profileDesc = getCombinedProfileDescription(primaryType, secondaryType);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-20 -right-20 h-40 w-40 rounded-full opacity-30 blur-3xl sm:-top-40 sm:-right-40 sm:h-80 sm:w-80"
          style={{ backgroundColor: dcasColors[primaryType].primary }}
        />
        <div
          className="absolute bottom-0 -left-20 h-40 w-40 rounded-full opacity-20 blur-3xl sm:-left-40 sm:h-80 sm:w-80"
          style={{ backgroundColor: dcasColors[secondaryType].primary }}
        />
      </div>

      <header className="relative top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Logo size="sm" showText textClassName="hidden text-sm font-semibold text-slate-900 sm:inline sm:text-base dark:text-white" />
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <ModeToggle />
              <Link href={`/report/${sessionId}`}>
                <Button
                  variant="outline"
                  className="btn-press gap-2 rounded-full border-indigo-200 text-sm dark:border-indigo-800"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Detailed Report</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="animate-fade-in mb-8 text-center sm:mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:mb-6 sm:px-4 sm:py-2 sm:text-sm dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            Assessment Complete
          </div>
          <h1 className="mb-3 text-2xl font-bold text-slate-900 sm:mb-4 sm:text-3xl md:text-4xl lg:text-5xl dark:text-white">
            Your DCAS Behavioural Profile
          </h1>
          <p className="mx-auto max-w-2xl px-2 text-sm text-slate-600 sm:text-base lg:text-lg dark:text-slate-400">
            Based on your responses, we&apos;ve identified your behavioral
            tendencies and career alignment.
          </p>
        </div>

        {/* Primary Type Hero */}
        <Card className="animate-fade-in-up mb-6 overflow-hidden border-0 shadow-2xl sm:mb-8">
          <div
            className="h-1.5 sm:h-2"
            style={{
              background: `linear-gradient(to right, ${dcasColors[primaryType].primary}, ${dcasColors[secondaryType].primary})`,
            }}
          />
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
              <div
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl text-3xl font-bold text-white shadow-xl sm:h-24 sm:w-24 sm:text-4xl"
                style={{
                  background: `linear-gradient(135deg, ${dcasColors[primaryType].primary}, ${dcasColors[primaryType].primary}dd)`,
                }}
              >
                {primaryType}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="mb-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start sm:gap-3">
                  <h2 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
                    The {defaultDCASNames[primaryType]}
                  </h2>
                  <Badge
                    className="px-2 py-0.5 text-xs sm:px-3 sm:py-1"
                    style={{
                      backgroundColor: dcasColors[primaryType].light,
                      color: dcasColors[primaryType].primary,
                    }}
                  >
                    Primary Type
                  </Badge>
                </div>
                <p className="mb-3 text-sm text-slate-600 sm:mb-4 sm:text-base lg:text-lg dark:text-slate-400">
                  {profileDesc}
                </p>
                <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                  <Badge
                    variant="outline"
                    className="rounded-full text-xs sm:text-sm"
                  >
                    {defaultDCASNames[primaryType]}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="rounded-full text-xs sm:text-sm"
                  >
                    Score: {scores[primaryType]} (
                    {getScoreLevel(scores[primaryType], 30)})
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score Cards */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:mb-12 sm:gap-4 lg:grid-cols-4">
          {(["D", "C", "A", "S"] as const).map((type, index) => (
            <div
              key={type}
              className={`animate-fade-in-up stagger-${index + 1}`}
            >
              <ScoreCard type={type} score={scores[type]} />
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="mb-8 grid gap-6 sm:mb-12 sm:gap-8 lg:grid-cols-2">
          <Card className="animate-fade-in-up border-0 shadow-xl">
            <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <CardTitle className="text-lg sm:text-xl">
                  Score Visualization
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={chartType === "bar" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("bar")}
                    className="btn-press rounded-full text-xs sm:text-sm"
                  >
                    Bar
                  </Button>
                  <Button
                    variant={chartType === "radar" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("radar")}
                    className="btn-press rounded-full text-xs sm:text-sm"
                  >
                    Radar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-2 pb-4 sm:px-6 sm:pb-6">
              <div className="w-full overflow-x-auto">
                {chartType === "bar" ? (
                  <DCASBarChart scores={scores} />
                ) : (
                  <DCASRadarChart scores={scores} />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up stagger-1 border-0 shadow-xl">
            <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
              <CardTitle className="text-lg sm:text-xl">
                Detailed Score Breakdown
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Your scores across all DCAS dimensions
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="space-y-3 sm:space-y-4">
                {rankedTypes.map((type, index) => {
                  const level = getScoreLevel(scores[type], 30);
                  const percentage = (scores[type] / 30) * 100;
                  return (
                    <div key={type} className="space-y-1.5 sm:space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white sm:h-8 sm:w-8 sm:text-sm"
                            style={{
                              backgroundColor: dcasColors[type].primary,
                            }}
                          >
                            {type}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-slate-900 sm:text-base dark:text-white">
                              {defaultDCASNames[type]}
                            </span>
                            {index === 0 && (
                              <Badge
                                className="ml-2 hidden text-xs sm:inline-flex"
                                variant="outline"
                              >
                                Primary
                              </Badge>
                            )}
                            {index === 1 && (
                              <Badge
                                className="ml-2 hidden text-xs sm:inline-flex"
                                variant="outline"
                              >
                                Secondary
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-slate-900 sm:text-base dark:text-white">
                            {scores[type]}
                          </span>
                          <span className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                            {" "}
                            / 30
                          </span>
                          <p className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">
                            {level}
                          </p>
                        </div>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 sm:h-2 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: dcasColors[type].primary,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Career Recommendations */}
        <div className="mb-8 sm:mb-12">
          <div className="mb-6 text-center sm:mb-8">
            <h2 className="mb-2 text-xl font-bold text-slate-900 sm:text-2xl md:text-3xl dark:text-white">
              Top Career Matches
            </h2>
            <p className="px-2 text-sm text-slate-600 sm:text-base dark:text-slate-400">
              Based on your DCAS profile, here are careers that align with your
              natural tendencies
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
            {careers.map((career, index) => (
              <Card
                key={index}
                className={`card-hover animate-fade-in-up border-0 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl stagger-${index + 1}`}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="mb-3 flex items-start justify-between sm:mb-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg sm:h-14 sm:w-14"
                      style={{
                        backgroundColor:
                          dcasColors[
                            career.source === "primary"
                              ? primaryType
                              : secondaryType
                          ].light,
                      }}
                    >
                      <CareerIcon
                        name={career.icon}
                        className="h-6 w-6 sm:h-7 sm:w-7"
                        style={{
                          color:
                            dcasColors[
                              career.source === "primary"
                                ? primaryType
                                : secondaryType
                            ].primary,
                        }}
                      />
                    </div>
                    <Badge
                      className="rounded-full text-xs"
                      style={{
                        backgroundColor:
                          dcasColors[
                            career.source === "primary"
                              ? primaryType
                              : secondaryType
                          ].light,
                        color:
                          dcasColors[
                            career.source === "primary"
                              ? primaryType
                              : secondaryType
                          ].primary,
                      }}
                    >
                      #{index + 1} Match
                    </Badge>
                  </div>
                  <h3 className="mb-2 text-base font-bold text-slate-900 sm:text-lg dark:text-white">
                    {career.title}
                  </h3>
                  <p className="mb-3 text-xs text-slate-600 sm:mb-4 sm:text-sm dark:text-slate-400">
                    {career.description}
                  </p>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {career.skills.slice(0, 3).map((skill, skillIndex) => (
                      <Badge
                        key={skillIndex}
                        variant="outline"
                        className="rounded-full text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Behavioural Summary */}
        <Card className="animate-fade-in-up mb-8 border-0 shadow-xl sm:mb-12">
          <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:gap-3 sm:text-xl">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-xl text-base font-bold text-white sm:h-10 sm:w-10 sm:text-lg"
                style={{ backgroundColor: dcasColors[primaryType].primary }}
              >
                {primaryType}
              </span>
              Behavioural Summary
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Understanding your {defaultDCASNames[primaryType]} profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 pb-4 sm:space-y-6 sm:px-6 sm:pb-6">
            <p className="text-sm leading-relaxed text-slate-700 sm:text-base dark:text-slate-300">
              {profileDesc}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900 sm:mb-3 sm:text-base dark:text-white">
                  <Sparkles className="h-4 w-4 text-emerald-500" /> Core
                  Strengths
                </h4>
                <ul className="space-y-1.5 sm:space-y-2">
                  {primaryInterp.strengths.slice(0, 4).map((s, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-xs text-slate-600 sm:text-sm dark:text-slate-400"
                    >
                      <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900 sm:mb-3 sm:text-base dark:text-white">
                  <Sparkles className="h-4 w-4 text-amber-500" /> Development
                  Areas
                </h4>
                <ul className="space-y-1.5 sm:space-y-2">
                  {primaryInterp.developmentAreas.slice(0, 4).map((a, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-xs text-slate-600 sm:text-sm dark:text-slate-400"
                    >
                      <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Card className="animate-fade-in-up border-0 bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-2xl">
            <CardContent className="p-6 sm:p-8">
              <h3 className="mb-2 text-xl font-bold sm:mb-3 sm:text-2xl">
                Assessment Complete!
              </h3>
              <p className="mx-auto mb-4 max-w-2xl px-2 text-sm text-indigo-100 sm:mb-6 sm:text-base">
                Thank you for completing the DCAS assessment. Download your detailed report for comprehensive insights.
              </p>
              <Link href={`/report/${sessionId}`}>
                <Button
                  size="lg"
                  className="btn-press rounded-full bg-white px-6 py-5 text-base font-semibold text-indigo-600 shadow-lg hover:bg-indigo-50 sm:px-8 sm:py-6 sm:text-lg"
                >
                  Download Report <Download className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="safe-area-inset relative z-10 mt-8 border-t border-slate-200 py-6 sm:mt-12 sm:py-8 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <p className="text-xs text-slate-600 sm:text-sm dark:text-slate-400">
            © {new Date().getFullYear()} DCAS Behavioural Assessment. Results
            are for guidance purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}
