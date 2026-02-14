import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { ArrowRight, BarChart2, Users, Anchor, Target } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 px-4 text-center bg-linear-to-b from-white to-slate-100">
          <div className="container mx-auto max-w-4xl space-y-8">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 uppercase tracking-wider">
              CBMF™ Framework
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900">
              Understand how you work. <br className="hidden md:block" />
              <span className="text-primary bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-violet-600">
                Choose where you belong.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Discover your dominant behavioural tendencies with the DCAS (Driver, Connector, Anchor, Strategist) Assessment. Gain clarity on your role-fit and career path in just 10 minutes.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Button asChild size="lg" className="h-12 px-8 text-base rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105">
                <Link href="/assessment">
                  Start Assessment <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<Target className="h-8 w-8 text-red-500" />}
                title="Driver"
                description="Results-oriented, decisive, and competitive leader."
              />
              <FeatureCard
                icon={<Users className="h-8 w-8 text-yellow-500" />}
                title="Connector"
                description="Social, enthusiastic, and persuasive communicator."
              />
              <FeatureCard
                icon={<Anchor className="h-8 w-8 text-green-500" />}
                title="Anchor"
                description="Supportive, stable, and consistent team player."
              />
              <FeatureCard
                icon={<BarChart2 className="h-8 w-8 text-blue-500" />}
                title="Strategist"
                description="Analytical, detail-oriented, and structured thinker."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 bg-slate-900 text-slate-400 text-sm text-center">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} DCAS Assessment. Based on CBMF™.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
      <div className="mb-4 bg-white p-3 rounded-xl w-fit shadow-sm border border-slate-100">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}
