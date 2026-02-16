import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { dcasColors } from "@/lib/dcas/scoring"
import { ModeToggle } from "@/components/theme-toggle"

const dcasTypes = {
  D: { name: "Driver", desc: "Results-oriented", detail: "individuals who are direct, decisive, and focused on achieving goals. They thrive under pressure.", tags: ["Leader", "Decisive", "Direct"], colorClass: "red" },
  C: { name: "Connector", desc: "People-oriented", detail: "individuals who are enthusiastic, optimistic, and love collaboration. They excel at inspiring others.", tags: ["Inspiring", "Social", "Creative"], colorClass: "amber" },
  A: { name: "Anchor", desc: "Stability-oriented", detail: "individuals who are patient, reliable, and team-focused. They create harmony and consistency.", tags: ["Reliable", "Patient", "Supportive"], colorClass: "emerald" },
  S: { name: "Strategist", desc: "Quality-oriented", detail: "individuals who are analytical, precise, and systematic. They ensure accuracy and high standards.", tags: ["Analytical", "Precise", "Systematic"], colorClass: "blue" },
} as const;

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 h-40 w-40 sm:h-80 sm:w-80 rounded-full bg-linear-to-br from-red-500/10 to-orange-500/10 blur-3xl animate-float" />
          <div className="absolute top-10 -left-20 sm:top-20 sm:-left-40 h-40 w-40 sm:h-80 sm:w-80 rounded-full bg-linear-to-br from-blue-500/10 to-cyan-500/10 blur-3xl animate-float stagger-2" />
          <div className="absolute bottom-0 right-1/4 h-30 w-30 sm:h-60 sm:w-60 rounded-full bg-linear-to-br from-green-500/10 to-emerald-500/10 blur-3xl animate-float stagger-3" />
          <div className="absolute bottom-10 left-1/4 sm:bottom-20 h-30 w-30 sm:h-60 sm:w-60 rounded-full bg-linear-to-br from-yellow-500/10 to-amber-500/10 blur-3xl animate-float stagger-4" />
        </div>

        {/* Navigation */}
        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 text-white font-bold shadow-lg text-sm sm:text-base">
              D
            </div>
            <span className="text-lg sm:text-xl font-bold bg-linear-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              DCAS Assessment
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Link href="/assessment">
              <Button variant="outline" className="rounded-full px-4 sm:px-6 text-sm sm:text-base btn-press">
                <span className="hidden sm:inline">Start Assessment</span>
                <span className="sm:hidden">Start</span>
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="mb-6 sm:mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
              </span>
              Behavioural Assessment for Students
            </div>

            {/* Main heading */}
            <h1 className="mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white animate-fade-in-up leading-tight">
              Discover Your{" "}
              <span className="bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                DCAS Behavioural
              </span>
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>& Career Direction
            </h1>

            <p className="mx-auto mb-8 sm:mb-10 max-w-2xl text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed animate-fade-in-up stagger-1 px-2">
              Take our comprehensive 30-question assessment to understand your behavioral style,
              unlock your strengths, and discover career paths that align with your natural tendencies.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-in-up stagger-2">
              <Link href="/assessment" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="group relative overflow-hidden rounded-full bg-linear-to-r from-indigo-600 to-purple-600 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30 w-full sm:w-auto btn-press"
                >
                  <span className="relative z-10">Start Assessment</span>
                  <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
                  <div className="absolute inset-0 -z-10 bg-linear-to-r from-purple-600 to-pink-600 opacity-0 transition-opacity group-hover:opacity-100" />
                </Button>
              </Link>
              <a href="#learn-more" className="w-full sm:w-auto">
                <Button variant="ghost" size="lg" className="rounded-full px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg w-full sm:w-auto btn-press">
                  Learn More
                </Button>
              </a>
            </div>

            {/* Stats */}
            <div className="mt-12 sm:mt-16 grid grid-cols-3 gap-4 sm:gap-8 border-t border-slate-200 dark:border-slate-800 pt-8 sm:pt-10 animate-fade-in-up stagger-3">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">30</p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Questions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">4</p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Behavioural Styles</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">12</p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Career Matches</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* DCAS Types Section */}
      <section id="learn-more" className="py-16 sm:py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-3 sm:mb-4 animate-fade-in">
              The Four DCAS Behavioural Styles
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 px-2">
              Understanding these behavioral patterns helps you leverage your strengths and work effectively with others.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {(["D", "C", "A", "S"] as const).map((type, idx) => {
              const info = dcasTypes[type];
              const stagger = idx === 0 ? "" : idx === 1 ? "stagger-1" : idx === 2 ? "stagger-2" : "stagger-3";
              const colorMap: Record<string, { bg: string; textAccent: string; tagBg: string; tagText: string; gradientFrom: string }> = {
                red: { bg: "from-red-500/5", textAccent: "text-red-600 dark:text-red-400", tagBg: "bg-red-100 dark:bg-red-900/30", tagText: "text-red-700 dark:text-red-300", gradientFrom: "from-red-500/5" },
                amber: { bg: "from-amber-500/5", textAccent: "text-amber-600 dark:text-amber-400", tagBg: "bg-amber-100 dark:bg-amber-900/30", tagText: "text-amber-700 dark:text-amber-300", gradientFrom: "from-amber-500/5" },
                emerald: { bg: "from-emerald-500/5", textAccent: "text-emerald-600 dark:text-emerald-400", tagBg: "bg-emerald-100 dark:bg-emerald-900/30", tagText: "text-emerald-700 dark:text-emerald-300", gradientFrom: "from-emerald-500/5" },
                blue: { bg: "from-blue-500/5", textAccent: "text-blue-600 dark:text-blue-400", tagBg: "bg-blue-100 dark:bg-blue-900/30", tagText: "text-blue-700 dark:text-blue-300", gradientFrom: "from-blue-500/5" },
              };
              const c = colorMap[info.colorClass];
              return (
                <Card key={type} className={`group relative overflow-hidden border-0 bg-white dark:bg-slate-900 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl card-hover animate-fade-in-up ${stagger}`}>
                  <div className={`absolute inset-0 bg-linear-to-br ${c.gradientFrom} to-transparent`} />
                  <CardContent className="relative p-5 sm:p-6">
                    <div
                      className="mb-3 sm:mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl text-xl sm:text-2xl font-bold text-white shadow-lg"
                      style={{ backgroundColor: dcasColors[type].primary }}
                    >
                      {type}
                    </div>
                    <h3 className="mb-2 text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{info.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      <span className={`font-medium ${c.textAccent}`}>{info.desc}</span> {info.detail}
                    </p>
                    <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
                      {info.tags.map((tag) => (
                        <span key={tag} className={`rounded-full ${c.tagBg} px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs font-medium ${c.tagText}`}>{tag}</span>
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
      <section className="py-16 sm:py-20 lg:py-32 bg-linear-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-3 sm:mb-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 px-2">
              Complete the assessment in three simple steps and receive your personalized results.
            </p>
          </div>

          <div className="grid gap-8 sm:gap-10 md:grid-cols-3 relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30" />

            {[
              { num: 1, title: "Take the Assessment", desc: "Answer 30 carefully crafted questions about your preferences and behaviors in various situations.", gradient: "from-indigo-500 to-purple-600", shadow: "shadow-indigo-500/30" },
              { num: 2, title: "Get Your Profile", desc: "Receive instant results with detailed insights about your behaviour and career direction", gradient: "from-purple-500 to-pink-600", shadow: "shadow-purple-500/30" },
              { num: 3, title: "Explore Careers", desc: "Discover career paths that align with your strengths and download a comprehensive report.", gradient: "from-pink-500 to-rose-600", shadow: "shadow-pink-500/30" },
            ].map((step, idx) => (
              <div key={step.num} className={`relative animate-fade-in-up ${idx > 0 ? `stagger-${idx}` : ""}`}>
                <div className="relative flex flex-col items-center text-center">
                  <div className={`mb-4 sm:mb-6 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl bg-linear-to-br ${step.gradient} text-2xl sm:text-3xl font-bold text-white shadow-lg ${step.shadow} animate-float ${idx > 0 ? `stagger-${idx + 1}` : ""}`}>
                    {step.num}
                  </div>
                  <h3 className="mb-2 text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{step.title}</h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xs">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 sm:mt-16 text-center">
            <Link href="/assessment">
              <Button
                size="lg"
                className="rounded-full bg-linear-to-r from-indigo-600 to-purple-600 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold shadow-lg shadow-indigo-500/25 btn-press"
              >
                Begin Your Journey
                <span className="ml-2">→</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-16 sm:py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-3 sm:mb-4">
              Who Is This For?
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 px-2">
              Our DCAS assessment is designed for students and educational professionals seeking career clarity.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 md:grid-cols-3">
            {[
              { emoji: "🎓", title: "High School Students", desc: "Discover your strengths before choosing college majors and future career paths.", gradient: "from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50", iconGradient: "from-indigo-500 to-purple-600" },
              { emoji: "📚", title: "College Students", desc: "Align your career aspirations with your natural behavioral tendencies for better job fit.", gradient: "from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50", iconGradient: "from-purple-500 to-pink-600" },
              { emoji: "🧭", title: "Career Counselors", desc: "Use data-driven insights to guide students toward fulfilling career choices.", gradient: "from-pink-50 to-rose-50 dark:from-pink-950/50 dark:to-rose-950/50", iconGradient: "from-pink-500 to-rose-600" },
            ].map((item, idx) => (
              <Card key={item.title} className={`border-0 bg-linear-to-br ${item.gradient} shadow-lg card-hover animate-fade-in-up ${idx > 0 ? `stagger-${idx}` : ""}`}>
                <CardContent className="p-6 sm:p-8 text-center">
                  <div className={`mx-auto mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-linear-to-br ${item.iconGradient} text-2xl sm:text-3xl shadow-lg`}>
                    {item.emoji}
                  </div>
                  <h3 className="mb-2 text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 sm:py-12 safe-area-inset">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 text-xs sm:text-sm font-bold text-white">
                D
              </div>
              <span className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">DCAS Assessment</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-center sm:text-right">
              © {new Date().getFullYear()} DCAS Behavioural Assessment. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
