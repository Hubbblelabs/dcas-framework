import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { ArrowRight, BarChart2, Users, Anchor, Target } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 md:py-32 px-4 text-center bg-linear-to-b from-slate-50 to-white overflow-hidden relative">
          <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
          <div className="container mx-auto max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20">
              CBMF™ Framework
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Understand how you work. <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-violet-600">
                Choose where you belong.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Discover your dominant behavioural tendencies with the DCAS (Driver, Connector, Anchor, Strategist) Assessment. Gain clarity on your role-fit and career path in just 10 minutes.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
              <Button asChild size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/25 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-primary/30">
                <Link href="/assessment">
                  Start Assessment <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-2 hover:bg-slate-50">
                <Link href="#how-it-works">
                  Learn More
                </Link>
              </Button>
            </div>

            <div className="pt-12 flex justify-center items-center gap-8 text-sm font-medium text-slate-500">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-slate-900">30</span>
                <span>Questions</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-slate-900">4</span>
                <span>Personality Styles</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-slate-900">12</span>
                <span>Career Matches</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - The Four Styles */}
        <section className="py-24 bg-white relative">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">The Four DCAS Personality Styles</h2>
              <p className="text-lg text-slate-600">Understanding these behavioral patterns helps you leverage your strengths and work effectively with others.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon={<Target className="h-8 w-8 text-red-600" />}
                title="Driver"
                description="Results-oriented, decisive, and competitive leader. They thrive under pressure."
                color="bg-red-50 border-red-100 hover:border-red-200"
                iconBg="bg-white text-red-600"
              />
              <FeatureCard
                icon={<Users className="h-8 w-8 text-yellow-600" />}
                title="Connector"
                description="Social, enthusiastic, and persuasive communicator. They excel at inspiring others."
                color="bg-yellow-50 border-yellow-100 hover:border-yellow-200"
                iconBg="bg-white text-yellow-600"
              />
              <FeatureCard
                icon={<Anchor className="h-8 w-8 text-green-600" />}
                title="Anchor"
                description="Supportive, stable, and consistent team player. They create harmony and consistency."
                color="bg-green-50 border-green-100 hover:border-green-200"
                iconBg="bg-white text-green-600"
              />
              <FeatureCard
                icon={<BarChart2 className="h-8 w-8 text-blue-600" />}
                title="Strategist"
                description="Analytical, detail-oriented, and structured thinker. They ensure accuracy and high standards."
                color="bg-blue-50 border-blue-100 hover:border-blue-200"
                iconBg="bg-white text-blue-600"
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
              <p className="text-lg text-slate-600">Complete the assessment in three simple steps and receive your personalized results.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <StepCard
                number="01"
                title="Take the Assessment"
                description="Answer 30 carefully crafted questions about your preferences and behaviors in various situations."
              />
              <StepCard
                number="02"
                title="Get Your Profile"
                description="Receive instant results with detailed insights about your personality type and behavioral tendencies."
              />
              <StepCard
                number="03"
                title="Explore Careers"
                description="Discover career paths that align with your strengths and download a comprehensive report."
              />
            </div>

            <div className="mt-12 text-center">
              <Button asChild size="lg" className="h-12 px-8 text-base rounded-full">
                <Link href="/assessment">
                  Begin Your Journey <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Who Is This For Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Who Is This For?</h2>
              <p className="text-lg text-slate-600">Our DCAS assessment is designed for students and educational professionals seeking career clarity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <AudienceCard
                title="High School Students"
                description="Discover your strengths before choosing college majors and future career paths."
              />
              <AudienceCard
                title="College Students"
                description="Align your career aspirations with your natural behavioral tendencies for better job fit."
              />
              <AudienceCard
                title="Career Counselors"
                description="Use data-driven insights to guide students toward fulfilling career choices."
              />
            </div>
          </div>
        </section>

      </main>

      <footer className="py-12 bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-lg tracking-tight">DCAS Framework</span>
            </div>
            <p>© {new Date().getFullYear()} DCAS Assessment. Based on CBMF™.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color, iconBg }: { icon: React.ReactNode, title: string, description: string, color?: string, iconBg?: string }) {
  return (
    <div className={`p-8 rounded-2xl border transition-all duration-300 hover:shadow-lg ${color || 'bg-slate-50 border-slate-100'}`}>
      <div className={`mb-6 p-4 rounded-xl w-fit shadow-sm ring-1 ring-inset ring-black/5 ${iconBg || 'bg-white'}`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="relative p-6 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition-colors">
      <div className="text-6xl font-black text-slate-100 absolute -top-4 -right-2 select-none pointer-events-none">
        {number}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3 relative z-10">{title}</h3>
      <p className="text-slate-600 relative z-10">{description}</p>
    </div>
  )
}

function AudienceCard({ title, description }: { title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 text-center hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300">
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  )
}
