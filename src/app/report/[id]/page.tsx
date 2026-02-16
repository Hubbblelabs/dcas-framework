"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DCASBarChart } from "@/components/charts/dcas-charts";
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
import { getCareerRecommendations, careersByType } from "@/lib/dcas/careers";
import { ModeToggle } from "@/components/theme-toggle";
import {
  Loader2,
  Download,
  ArrowLeft,
  Dumbbell,
  Target,
  MessageCircle,
  AlertTriangle,
  Pin,
} from "lucide-react";
import { CareerIcon } from "@/components/career-icon";

export default function ReportPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;
  const reportRef = useRef<HTMLDivElement>(null);
  const [scores, setScores] = useState<DCASScores | null>(null);
  const [rankedTypes, setRankedTypes] = useState<DCASType[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    if (sessionId === "local") {
      const storedScores = sessionStorage.getItem("dcasScores");
      const storedRankedTypes = sessionStorage.getItem("dcasRankedTypes");
      if (storedScores && storedRankedTypes) {
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

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const noPrintElements = document.querySelectorAll(".no-print");
      noPrintElements.forEach(
        (el) => ((el as HTMLElement).style.display = "none"),
      );
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });
      noPrintElements.forEach((el) => ((el as HTMLElement).style.display = ""));
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const scaledImgHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = scaledImgHeight;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, scaledImgHeight);
      heightLeft -= pdfHeight;
      while (heightLeft > 0) {
        position = heightLeft - scaledImgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, scaledImgHeight);
        heightLeft -= pdfHeight;
      }
      const date = new Date().toISOString().split("T")[0];
      pdf.save(`DCAS-Behavioural-Report-${date}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (!isLoaded || !scores) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="px-4 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-indigo-600 sm:h-12 sm:w-12"></div>
          <p className="text-sm text-slate-600 sm:text-base dark:text-slate-400">
            Loading your report...
          </p>
        </div>
      </div>
    );
  }

  const primaryType = rankedTypes[0];
  const secondaryType = rankedTypes[1];
  const tertiaryType = rankedTypes[2];
  const primaryInterp = interpretations[primaryType];
  const secondaryInterp = interpretations[secondaryType];
  const profileDesc = getCombinedProfileDescription(primaryType, secondaryType);
  const careers = getCareerRecommendations(primaryType, secondaryType);

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .print-break {
            page-break-before: always;
          }
        }
      `}</style>

      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <header className="no-print relative top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/80">
          <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white sm:h-8 sm:w-8 sm:text-sm">
                  D
                </div>
                <span className="hidden text-sm font-semibold text-slate-900 sm:inline sm:text-base dark:text-white">
                  DCAS Assessment
                </span>
              </Link>
              <div className="flex items-center gap-2 sm:gap-3">
                <ModeToggle />
                <Button
                  variant="outline"
                  className="btn-press gap-1.5 rounded-full border-indigo-200 px-3 text-xs sm:gap-2 sm:px-4 sm:text-sm dark:border-indigo-800"
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                >
                  {isGeneratingPdf ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Generating...</span>
                      <span className="sm:hidden">Wait</span>
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Download PDF</span>
                      <span className="sm:hidden">PDF</span>
                    </>
                  )}
                </Button>
                <Link href={`/results/${sessionId}`}>
                  <Button
                    variant="ghost"
                    className="btn-press gap-1 rounded-full text-xs sm:text-sm"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Results</span>
                    <span className="sm:hidden">Back</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div
          ref={reportRef}
          className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12"
        >
          {/* Report Header */}
          <div className="animate-fade-in mb-8 border-b border-slate-200 pb-6 text-center sm:mb-12 sm:pb-8 dark:border-slate-800">
            <div className="mb-4 inline-flex items-center justify-center gap-3 sm:mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white shadow-lg sm:h-16 sm:w-16 sm:text-2xl">
                D
              </div>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl dark:text-white">
              DCAS Behavioural Assessment Report
            </h1>
            <p className="text-sm text-slate-600 sm:text-base dark:text-slate-400">
              Comprehensive Behavioural Analysis & Career Guidance
            </p>
            <p className="mt-3 text-xs text-slate-500 sm:mt-4 sm:text-sm dark:text-slate-400">
              Generated on {currentDate}
            </p>
          </div>

          {/* 1. Profile Overview */}
          <section className="animate-fade-in-up mb-8 sm:mb-12">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900 sm:mb-6 sm:gap-3 sm:text-2xl dark:text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-sm text-indigo-600 sm:h-8 sm:w-8 sm:text-base dark:bg-indigo-900/30 dark:text-indigo-400">
                1
              </span>
              Profile Overview
            </h2>
            <Card className="overflow-hidden border-0 shadow-xl">
              <div
                className="h-1.5 sm:h-2"
                style={{
                  background: `linear-gradient(to right, ${dcasColors[primaryType].primary}, ${dcasColors[secondaryType].primary}, ${dcasColors[tertiaryType].primary})`,
                }}
              />
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
                  {[
                    { type: primaryType, label: "Primary Type" },
                    { type: secondaryType, label: "Secondary Type" },
                    { type: tertiaryType, label: "Tertiary Type" },
                  ].map(({ type, label }) => (
                    <div key={type + label} className="text-center">
                      <div
                        className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg sm:mb-4 sm:h-20 sm:w-20 sm:text-3xl"
                        style={{ backgroundColor: dcasColors[type].primary }}
                      >
                        {type}
                      </div>
                      <Badge
                        className="mb-2 text-xs"
                        style={{
                          backgroundColor: dcasColors[type].light,
                          color: dcasColors[type].primary,
                        }}
                      >
                        {label}
                      </Badge>
                      <h3 className="text-sm font-bold text-slate-900 sm:text-base dark:text-white">
                        {defaultDCASNames[type]}
                      </h3>
                      <p
                        className="text-lg font-bold sm:text-2xl"
                        style={{ color: dcasColors[type].primary }}
                      >
                        {scores[type]} / 30
                      </p>
                      <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                        {getScoreLevel(scores[type], 30)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* 2. Score Visualization */}
          <section className="animate-fade-in-up stagger-1 mb-8 sm:mb-12">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900 sm:mb-6 sm:gap-3 sm:text-2xl dark:text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-sm text-indigo-600 sm:h-8 sm:w-8 sm:text-base dark:bg-indigo-900/30 dark:text-indigo-400">
                2
              </span>
              Score Visualization
            </h2>
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              <Card className="border-0 shadow-xl">
                <CardHeader className="px-4 py-4 sm:px-6">
                  <CardTitle className="text-base sm:text-lg">
                    DCAS Score Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-2 pb-4 sm:px-6 sm:pb-6">
                  <div className="w-full overflow-x-auto">
                    <DCASBarChart scores={scores} />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-xl">
                <CardHeader className="px-4 py-4 sm:px-6">
                  <CardTitle className="text-base sm:text-lg">
                    Score Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[320px]">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800">
                          <th className="py-2 text-left text-xs font-semibold text-slate-900 sm:py-3 sm:text-sm dark:text-white">
                            Type
                          </th>
                          <th className="py-2 text-center text-xs font-semibold text-slate-900 sm:py-3 sm:text-sm dark:text-white">
                            Score
                          </th>
                          <th className="hidden py-2 text-center text-xs font-semibold text-slate-900 sm:table-cell sm:py-3 sm:text-sm dark:text-white">
                            Level
                          </th>
                          <th className="py-2 text-right text-xs font-semibold text-slate-900 sm:py-3 sm:text-sm dark:text-white">
                            Rank
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {rankedTypes.map((type, index) => (
                          <tr
                            key={type}
                            className="border-b border-slate-100 dark:border-slate-800"
                          >
                            <td className="py-2 sm:py-3">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div
                                  className="flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold text-white sm:h-8 sm:w-8 sm:text-sm"
                                  style={{
                                    backgroundColor: dcasColors[type].primary,
                                  }}
                                >
                                  {type}
                                </div>
                                <span className="text-xs text-slate-700 sm:text-sm dark:text-slate-300">
                                  {defaultDCASNames[type]}
                                </span>
                              </div>
                            </td>
                            <td
                              className="py-2 text-center text-xs font-bold sm:py-3 sm:text-sm"
                              style={{ color: dcasColors[type].primary }}
                            >
                              {scores[type]} / 30
                            </td>
                            <td className="hidden py-2 text-center sm:table-cell sm:py-3">
                              <Badge variant="outline" className="text-xs">
                                {getScoreLevel(scores[type], 30)}
                              </Badge>
                            </td>
                            <td className="py-2 text-right text-xs text-slate-500 sm:py-3 sm:text-sm dark:text-slate-400">
                              #{index + 1}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* 3. Behaviourial Description */}
          <section className="print-break animate-fade-in-up stagger-2 mb-8 sm:mb-12">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900 sm:mb-6 sm:gap-3 sm:text-2xl dark:text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-sm text-indigo-600 sm:h-8 sm:w-8 sm:text-base dark:bg-indigo-900/30 dark:text-indigo-400">
                3
              </span>
              Behavioural Description
            </h2>
            <Card className="border-0 shadow-xl">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="mb-4 flex flex-col items-center gap-3 sm:mb-6 sm:flex-row sm:items-start sm:gap-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white sm:h-16 sm:w-16 sm:text-3xl"
                    style={{ backgroundColor: dcasColors[primaryType].primary }}
                  >
                    {primaryType}
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
                      {defaultDCASNames[primaryType]}
                    </h3>
                    <p className="text-sm text-slate-600 sm:text-base dark:text-slate-400">
                      {primaryInterp.traits.join(" · ")}
                    </p>
                  </div>
                </div>
                <p className="mb-6 text-sm leading-relaxed text-slate-700 sm:mb-8 sm:text-base lg:text-lg dark:text-slate-300">
                  {profileDesc}
                </p>
                <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
                  <div>
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 sm:mb-4 sm:text-base dark:text-white">
                      <Dumbbell className="h-5 w-5 text-emerald-500 sm:h-6 sm:w-6" />{" "}
                      Core Strengths
                    </h4>
                    <ul className="space-y-2 sm:space-y-3">
                      {primaryInterp.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 sm:gap-3">
                          <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 sm:h-2 sm:w-2" />
                          <span className="text-xs text-slate-600 sm:text-sm dark:text-slate-400">
                            {s}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 sm:mb-4 sm:text-base dark:text-white">
                      <Target className="h-5 w-5 text-blue-500 sm:h-6 sm:w-6" />{" "}
                      Key Traits
                    </h4>
                    <ul className="space-y-2 sm:space-y-3">
                      {primaryInterp.traits.map((t, i) => (
                        <li key={i} className="flex items-start gap-2 sm:gap-3">
                          <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500 sm:h-2 sm:w-2" />
                          <span className="text-xs text-slate-600 sm:text-sm dark:text-slate-400">
                            {t}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* 4. Communication & Stress */}
          <section className="mb-8 sm:mb-12">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900 sm:mb-6 sm:gap-3 sm:text-2xl dark:text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-sm text-indigo-600 sm:h-8 sm:w-8 sm:text-base dark:bg-indigo-900/30 dark:text-indigo-400">
                4
              </span>
              Communication & Stress Patterns
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
              <Card className="border-0 shadow-xl">
                <CardHeader className="px-4 py-4 sm:px-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />{" "}
                    Communication Style
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                  <p className="text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-400">
                    {primaryInterp.communicationStyle}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-xl">
                <CardHeader className="px-4 py-4 sm:px-6">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" /> Stress
                    Response
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                  <p className="text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-400">
                    {primaryInterp.stressResponse}
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* 5. Development Areas */}
          <section className="mb-8 sm:mb-12">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900 sm:mb-6 sm:gap-3 sm:text-2xl dark:text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-sm text-indigo-600 sm:h-8 sm:w-8 sm:text-base dark:bg-indigo-900/30 dark:text-indigo-400">
                5
              </span>
              Development Areas
            </h2>
            <Card className="border-0 shadow-xl">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <p className="mb-4 text-xs text-slate-600 sm:mb-6 sm:text-sm dark:text-slate-400">
                  While your DCAS profile highlights many strengths, focusing on
                  these development areas will help you become more well-rounded
                  and effective.
                </p>
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  {primaryInterp.developmentAreas.map((area, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 sm:gap-3 sm:p-4 dark:border-amber-800 dark:bg-amber-950/20"
                    >
                      <Pin className="h-5 w-5 shrink-0 text-amber-500 sm:h-6 sm:w-6" />
                      <span className="text-xs text-slate-700 sm:text-sm dark:text-slate-300">
                        {area}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* 6. Career Recommendations */}
          <section className="print-break mb-8 sm:mb-12">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900 sm:mb-6 sm:gap-3 sm:text-2xl dark:text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-sm text-indigo-600 sm:h-8 sm:w-8 sm:text-base dark:bg-indigo-900/30 dark:text-indigo-400">
                6
              </span>
              Career Recommendations
            </h2>
            <p className="mb-4 text-xs text-slate-600 sm:mb-6 sm:text-sm dark:text-slate-400">
              Based on your DCAS profile, the following careers align with your
              natural behavioural tendencies.
            </p>
            {rankedTypes.slice(0, 3).map((type, typeIndex) => (
              <div key={type} className="mb-6 sm:mb-8">
                <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white sm:h-8 sm:w-8 sm:text-sm"
                    style={{ backgroundColor: dcasColors[type].primary }}
                  >
                    {type}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 sm:text-base dark:text-white">
                    {defaultDCASNames[type]} Careers
                    <span className="ml-2 text-xs font-normal text-slate-500 sm:text-sm dark:text-slate-400">
                      (
                      {typeIndex === 0
                        ? "Primary"
                        : typeIndex === 1
                          ? "Secondary"
                          : "Tertiary"}
                      )
                    </span>
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                  {(careersByType[type] || [])
                    .slice(0, 3)
                    .map((career, index) => (
                      <Card key={index} className="border shadow-sm">
                        <CardContent className="p-3 sm:p-5">
                          <div className="mb-2 flex items-center gap-2 sm:mb-3 sm:gap-3">
                            <CareerIcon
                              name={career.icon}
                              className="h-6 w-6 text-slate-700 dark:text-slate-300"
                            />
                            <h4 className="text-sm font-semibold text-slate-900 sm:text-base dark:text-white">
                              {career.title}
                            </h4>
                          </div>
                          <p className="mb-2 text-xs text-slate-600 sm:mb-3 sm:text-sm dark:text-slate-400">
                            {career.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {career.skills.map((skill, si) => (
                              <Badge
                                key={si}
                                variant="outline"
                                className="text-xs"
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
            ))}
          </section>

          {/* 7. Action Plan */}
          <section className="mb-8 sm:mb-12">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900 sm:mb-6 sm:gap-3 sm:text-2xl dark:text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-sm text-indigo-600 sm:h-8 sm:w-8 sm:text-base dark:bg-indigo-900/30 dark:text-indigo-400">
                7
              </span>
              Action Plan for Growth
            </h2>
            <Card className="border-0 bg-linear-to-br from-indigo-50 to-purple-50 shadow-xl dark:from-indigo-950/30 dark:to-purple-950/30">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <p className="mb-4 text-xs text-slate-700 sm:mb-6 sm:text-sm dark:text-slate-300">
                  Based on your {defaultDCASNames[primaryType]} profile,
                  here&apos;s a personalized action plan to maximize your
                  strengths and address development areas:
                </p>
                <div className="space-y-4 sm:space-y-6">
                  {[
                    {
                      num: 1,
                      color: "bg-emerald-500",
                      title: "Leverage Your Strengths",
                      desc: `Your ${defaultDCASNames[primaryType].toLowerCase()} trait is your superpower. Seek opportunities where ${primaryInterp.strengths[0]?.toLowerCase()} is valued.`,
                    },
                    {
                      num: 2,
                      color: "bg-blue-500",
                      title: "Build Complementary Skills",
                      desc: `Focus on developing skills from your secondary type (${defaultDCASNames[secondaryType]}). This will make you more versatile in team settings and leadership roles.`,
                    },
                    {
                      num: 3,
                      color: "bg-amber-500",
                      title: "Address Development Areas",
                      desc: `Start with: "${primaryInterp.developmentAreas[0]}". Set specific goals and seek feedback from mentors or peers.`,
                    },
                    {
                      num: 4,
                      color: "bg-purple-500",
                      title: "Explore Career Paths",
                      desc: "Research the recommended careers above. Connect with professionals in these fields through networking or informational interviews.",
                    },
                    {
                      num: 5,
                      color: "bg-pink-500",
                      title: "Seek Ideal Environments",
                      desc: `Look for work environments that suit: ${primaryInterp.workEnvironment}. This is where you'll naturally thrive.`,
                    },
                  ].map((step) => (
                    <div
                      key={step.num}
                      className="flex items-start gap-3 sm:gap-4"
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${step.color} text-sm font-bold text-white sm:text-base`}
                      >
                        {step.num}
                      </div>
                      <div>
                        <h4 className="mb-1 text-sm font-bold text-slate-900 sm:text-base dark:text-white">
                          {step.title}
                        </h4>
                        <p className="text-xs text-slate-600 sm:text-sm dark:text-slate-400">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Footer */}
          <div className="border-t border-slate-200 pt-6 text-center sm:pt-8 dark:border-slate-800">
            <p className="mb-3 px-2 text-xs text-slate-500 sm:mb-4 sm:text-sm dark:text-slate-400">
              This report is generated based on your DCAS assessment responses.
              Results are for career guidance purposes and should be used
              alongside other career exploration tools.
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              © {new Date().getFullYear()} DCAS Behavioural Assessment |
              Generated on {currentDate}
            </p>
          </div>

          {/* Print CTA */}
          <div className="no-print safe-area-inset mt-8 text-center sm:mt-12">
            <Card className="border-0 bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-2xl">
              <CardContent className="p-6 sm:p-8">
                <h3 className="mb-2 text-xl font-bold sm:mb-3 sm:text-2xl">
                  Save Your Report
                </h3>
                <p className="mx-auto mb-4 max-w-2xl px-2 text-sm text-indigo-100 sm:mb-6 sm:text-base">
                  Download this comprehensive report as a PDF to share with
                  career counselors, keep for future reference, or include in
                  your career portfolio.
                </p>
                <Button
                  size="lg"
                  className="btn-press gap-2 rounded-full bg-white px-6 py-5 text-base font-semibold text-indigo-600 shadow-lg hover:bg-indigo-50 sm:px-8 sm:py-6 sm:text-lg"
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                >
                  {isGeneratingPdf ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5" /> Download PDF
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
