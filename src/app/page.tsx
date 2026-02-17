import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { dcasColors as defaultDcasColors, defaultDCASNames, DCASType } from "@/lib/dcas/scoring";
import { ModeToggle } from "@/components/theme-toggle";
import { GraduationCap, BookOpen, Compass, ArrowRight } from "lucide-react";
import { connectToDatabase } from "@/lib/mongodb";
import { Settings, SETTINGS_KEYS } from "@/lib/models/Settings";

async function getDCASConfig() {
  try {
    await connectToDatabase();
    const [namesSetting, colorsSetting] = await Promise.all([
      Settings.findOne({ key: SETTINGS_KEYS.DCAS_NAMES }).lean(),
      Settings.findOne({ key: SETTINGS_KEYS.DCAS_COLORS }).lean(),
    ]);

    const names: Record<DCASType, string> = namesSetting?.value ?? defaultDCASNames;
    const customColors: Record<DCASType, string> | null = colorsSetting?.value ?? null;

    return { names, customColors };
  } catch {
    return { names: defaultDCASNames, customColors: null };
  }
}

const dcasTypeDefaults = {
  D: {
    desc: "Results-oriented",
    detail:
      "individuals who are direct, decisive, and focused on achieving goals. They thrive under pressure.",
    tags: ["Leader", "Decisive", "Direct"],
    colorClass: "red",
  },
  C: {
    desc: "People-oriented",
    detail:
      "individuals who are enthusiastic, optimistic, and love collaboration. They excel at inspiring others.",
    tags: ["Inspiring", "Social", "Creative"],
    colorClass: "amber",
  },
  A: {
    desc: "Stability-oriented",
    detail:
      "individuals who are patient, reliable, and team-focused. They create harmony and consistency.",
    tags: ["Reliable", "Patient", "Supportive"],
    colorClass: "emerald",
  },
  S: {
    desc: "Quality-oriented",
    detail:
      "individuals who are analytical, precise, and systematic. They ensure accuracy and high standards.",
    tags: ["Analytical", "Precise", "Systematic"],
    colorClass: "blue",
  },
} as const;

export const dynamic = "force-dynamic";

export default async function Home() {
  const { names, customColors } = await getDCASConfig();

  // Build effective colors map
  const effectiveColors = { ...defaultDcasColors };
  if (customColors) {
    (["D", "C", "A", "S"] as DCASType[]).forEach((type) => {
      if (customColors[type]) {
        effectiveColors[type] = {
          ...effectiveColors[type],
          primary: customColors[type],
        };
      }
    });
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-float absolute -top-20 -right-20 h-40 w-40 rounded-full bg-linear-to-br from-red-500/10 to-orange-500/10 blur-3xl sm:-top-40 sm:-right-40 sm:h-80 sm:w-80" />
          <div className="animate-float stagger-2 absolute top-10 -left-20 h-40 w-40 rounded-full bg-linear-to-br from-blue-500/10 to-cyan-500/10 blur-3xl sm:top-20 sm:-left-40 sm:h-80 sm:w-80" />
          <div className="animate-float stagger-3 absolute right-1/4 bottom-0 h-30 w-30 rounded-full bg-linear-to-br from-green-500/10 to-emerald-500/10 blur-3xl sm:h-60 sm:w-60" />
          <div className="animate-float stagger-4 absolute bottom-10 left-1/4 h-30 w-30 rounded-full bg-linear-to-br from-yellow-500/10 to-amber-500/10 blur-3xl sm:bottom-20 sm:h-60 sm:w-60" />
        </div>

        {/* Navigation */}
        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 sm:py-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-lg sm:h-10 sm:w-10 sm:text-base">
              D
            </div>
            <span className="bg-linear-to-r from-slate-800 to-slate-600 bg-clip-text text-lg font-bold text-transparent sm:text-xl dark:from-white dark:to-slate-300">
              DCAS Assessment
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Link href="/assessment">
              <Button
                variant="outline"
                className="btn-press rounded-full px-4 text-sm sm:px-6 sm:text-base"
              >
                <span className="hidden sm:inline">Start Assessment</span>
                <span className="sm:hidden">Start</span>
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 sm:mb-8 sm:px-4 sm:py-2 sm:text-sm dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
              </span>
              Behavioural Assessment for Students
            </div>

            {/* Main heading */}
            <h1 className="animate-fade-in-up mb-4 text-3xl leading-tight font-bold tracking-tight text-slate-900 sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl dark:text-white">
              Discover Your{" "}
              <span className="animate-gradient bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                DCAS Behavioural
              </span>
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>& Career Direction
            </h1>

            <p className="animate-fade-in-up stagger-1 mx-auto mb-8 max-w-2xl px-2 text-base leading-relaxed text-slate-600 sm:mb-10 sm:text-lg dark:text-slate-400">
              Take our comprehensive 30-question assessment to understand your
              behavioral style, unlock your strengths, and discover career paths
              that align with your natural tendencies.
            </p>

            {/* CTA Buttons */}
            <div className="animate-fade-in-up stagger-2 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link href="/assessment" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="group btn-press relative w-full overflow-hidden rounded-full bg-linear-to-r from-indigo-600 to-purple-600 px-6 py-5 text-base font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30 sm:w-auto sm:px-8 sm:py-6 sm:text-lg"
                >
                  <span className="relative z-10">Start Assessment</span>
                  <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                    <ArrowRight className="h-5 w-5" />
                  </span>
                  <div className="absolute inset-0 -z-10 bg-linear-to-r from-purple-600 to-pink-600 opacity-0 transition-opacity group-hover:opacity-100" />
                </Button>
              </Link>
              <a href="#learn-more" className="w-full sm:w-auto">
                <Button
                  variant="ghost"
                  size="lg"
                  className="btn-press w-full rounded-full px-6 py-5 text-base sm:w-auto sm:px-8 sm:py-6 sm:text-lg"
                >
                  Learn More
                </Button>
              </a>
            </div>

            {/* Stats */}
            <div className="animate-fade-in-up stagger-3 mt-12 grid grid-cols-3 gap-4 border-t border-slate-200 pt-8 sm:mt-16 sm:gap-8 sm:pt-10 dark:border-slate-800">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
                  30
                </p>
                <p className="text-xs text-slate-600 sm:text-sm dark:text-slate-400">
                  Questions
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
                  4
                </p>
                <p className="text-xs text-slate-600 sm:text-sm dark:text-slate-400">
                  Behavioural Styles
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
                  12
                </p>
                <p className="text-xs text-slate-600 sm:text-sm dark:text-slate-400">
                  Career Matches
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* DCAS Types Section */}
      <section id="learn-more" className="py-16 sm:py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-16">
            <h2 className="animate-fade-in mb-3 text-2xl font-bold tracking-tight text-slate-900 sm:mb-4 sm:text-3xl lg:text-4xl dark:text-white">
              The Four DCAS Behavioural Styles
            </h2>
            <p className="px-2 text-base text-slate-600 sm:text-lg dark:text-slate-400">
              Understanding these behavioral patterns helps you leverage your
              strengths and work effectively with others.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {(["D", "C", "A", "S"] as const).map((type, idx) => {
              const info = dcasTypeDefaults[type];
              const stagger =
                idx === 0
                  ? ""
                  : idx === 1
                    ? "stagger-1"
                    : idx === 2
                      ? "stagger-2"
                      : "stagger-3";
              const colorMap: Record<
                string,
                {
                  bg: string;
                  textAccent: string;
                  tagBg: string;
                  tagText: string;
                  gradientFrom: string;
                }
              > = {
                red: {
                  bg: "from-red-500/5",
                  textAccent: "text-red-600 dark:text-red-400",
                  tagBg: "bg-red-100 dark:bg-red-900/30",
                  tagText: "text-red-700 dark:text-red-300",
                  gradientFrom: "from-red-500/5",
                },
                amber: {
                  bg: "from-amber-500/5",
                  textAccent: "text-amber-600 dark:text-amber-400",
                  tagBg: "bg-amber-100 dark:bg-amber-900/30",
                  tagText: "text-amber-700 dark:text-amber-300",
                  gradientFrom: "from-amber-500/5",
                },
                emerald: {
                  bg: "from-emerald-500/5",
                  textAccent: "text-emerald-600 dark:text-emerald-400",
                  tagBg: "bg-emerald-100 dark:bg-emerald-900/30",
                  tagText: "text-emerald-700 dark:text-emerald-300",
                  gradientFrom: "from-emerald-500/5",
                },
                blue: {
                  bg: "from-blue-500/5",
                  textAccent: "text-blue-600 dark:text-blue-400",
                  tagBg: "bg-blue-100 dark:bg-blue-900/30",
                  tagText: "text-blue-700 dark:text-blue-300",
                  gradientFrom: "from-blue-500/5",
                },
              };
              const c = colorMap[info.colorClass];
              return (
                <Card
                  key={type}
                  className={`group card-hover animate-fade-in-up relative overflow-hidden border-0 bg-white shadow-lg shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900 dark:shadow-slate-950/50 ${stagger}`}
                >
                  <div
                    className={`absolute inset-0 bg-linear-to-br ${c.gradientFrom} to-transparent`}
                  />
                  <CardContent className="relative p-5 sm:p-6">
                    <div
                      className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-lg sm:mb-4 sm:h-14 sm:w-14 sm:text-2xl"
                      style={{ backgroundColor: effectiveColors[type].primary }}
                    >
                      {type}
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-slate-900 sm:text-xl dark:text-white">
                      {names[type]}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      <span className={`font-medium ${c.textAccent}`}>
                        {info.desc}
                      </span>{" "}
                      {info.detail}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
                      {info.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className={`rounded-full ${c.tagBg} px-2.5 py-0.5 text-xs font-medium sm:px-3 sm:py-1 ${c.tagText}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-linear-to-b from-slate-50 to-white py-16 sm:py-20 lg:py-32 dark:from-slate-900 dark:to-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-16">
            <h2 className="mb-3 text-2xl font-bold tracking-tight text-slate-900 sm:mb-4 sm:text-3xl lg:text-4xl dark:text-white">
              How It Works
            </h2>
            <p className="px-2 text-base text-slate-600 sm:text-lg dark:text-slate-400">
              Complete the assessment in three simple steps and receive your
              personalized results.
            </p>
          </div>

          <div className="relative grid gap-8 sm:gap-10 md:grid-cols-3">
            <div className="absolute top-12 right-1/6 left-1/6 hidden h-0.5 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30 md:block" />

            {[
              {
                num: 1,
                title: "Take the Assessment",
                desc: "Answer 30 carefully crafted questions about your preferences and behaviors in various situations.",
                gradient: "from-indigo-500 to-purple-600",
                shadow: "shadow-indigo-500/30",
              },
              {
                num: 2,
                title: "Get Your Profile",
                desc: "Receive instant results with detailed insights about your behaviour and career direction",
                gradient: "from-purple-500 to-pink-600",
                shadow: "shadow-purple-500/30",
              },
              {
                num: 3,
                title: "Explore Careers",
                desc: "Discover career paths that align with your strengths and download a comprehensive report.",
                gradient: "from-pink-500 to-rose-600",
                shadow: "shadow-pink-500/30",
              },
            ].map((step, idx) => (
              <div
                key={step.num}
                className={`animate-fade-in-up relative ${idx > 0 ? `stagger-${idx}` : ""}`}
              >
                <div className="relative flex flex-col items-center text-center">
                  <div
                    className={`mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br sm:mb-6 sm:h-24 sm:w-24 ${step.gradient} text-2xl font-bold text-white shadow-lg sm:text-3xl ${step.shadow} animate-float ${idx > 0 ? `stagger-${idx + 1}` : ""}`}
                  >
                    {step.num}
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-slate-900 sm:text-xl dark:text-white">
                    {step.title}
                  </h3>
                  <p className="max-w-xs text-sm text-slate-600 sm:text-base dark:text-slate-400">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center sm:mt-16">
            <Link href="/assessment">
              <Button
                size="lg"
                className="btn-press rounded-full bg-linear-to-r from-indigo-600 to-purple-600 px-6 py-5 text-base font-semibold shadow-lg shadow-indigo-500/25 sm:px-8 sm:py-6 sm:text-lg"
              >
                Begin Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-16 sm:py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-16">
            <h2 className="mb-3 text-2xl font-bold tracking-tight text-slate-900 sm:mb-4 sm:text-3xl lg:text-4xl dark:text-white">
              Who Is This For?
            </h2>
            <p className="px-2 text-base text-slate-600 sm:text-lg dark:text-slate-400">
              Our DCAS assessment is designed for students and educational
              professionals seeking career clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3 md:gap-8">
            {[
              {
                icon: (
                  <GraduationCap className="h-8 w-8 text-white sm:h-9 sm:w-9" />
                ),
                title: "High School Students",
                desc: "Discover your strengths before choosing college majors and future career paths.",
                gradient:
                  "from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50",
                iconGradient: "from-indigo-500 to-purple-600",
              },
              {
                icon: <BookOpen className="h-8 w-8 text-white sm:h-9 sm:w-9" />,
                title: "College Students",
                desc: "Align your career aspirations with your natural behavioral tendencies for better job fit.",
                gradient:
                  "from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50",
                iconGradient: "from-purple-500 to-pink-600",
              },
              {
                icon: <Compass className="h-8 w-8 text-white sm:h-9 sm:w-9" />,
                title: "Career Counselors",
                desc: "Use data-driven insights to guide students toward fulfilling career choices.",
                gradient:
                  "from-pink-50 to-rose-50 dark:from-pink-950/50 dark:to-rose-950/50",
                iconGradient: "from-pink-500 to-rose-600",
              },
            ].map((item, idx) => (
              <Card
                key={item.title}
                className={`border-0 bg-linear-to-br ${item.gradient} card-hover animate-fade-in-up shadow-lg ${idx > 0 ? `stagger-${idx}` : ""}`}
              >
                <CardContent className="p-6 text-center sm:p-8">
                  <div
                    className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br sm:h-16 sm:w-16 ${item.iconGradient} shadow-lg`}
                  >
                    {item.icon}
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-slate-900 sm:text-xl dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 sm:text-base dark:text-slate-400">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="safe-area-inset border-t border-slate-200 py-8 sm:py-12 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white sm:h-8 sm:w-8 sm:text-sm">
                D
              </div>
              <span className="text-sm font-semibold text-slate-900 sm:text-base dark:text-white">
                DCAS Assessment
              </span>
            </div>
            <p className="text-center text-xs text-slate-600 sm:text-right sm:text-sm dark:text-slate-400">
              © {new Date().getFullYear()} DCAS Behavioural Assessment. All
              rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
