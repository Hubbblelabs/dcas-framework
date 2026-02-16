"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, AlertCircle, Lock } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password");
        setIsLoading(false);
      } else if (result?.ok) {
        window.location.href = "/admin/dashboard";
      }
    } catch {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#0a0a0a] text-white">
      {/* Left Column */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-white/5 bg-black p-12 lg:flex">
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-neutral-900/50 via-[#0a0a0a] to-[#0a0a0a]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-size-[40px_40px]" />
        </div>
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div>
            <Link href="/" className="group inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-shadow group-hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                <div className="h-5 w-5 rounded-full bg-black" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tight text-white">
                  DCAS
                </span>
                <span className="font-mono text-[10px] tracking-widest text-cyan-400 uppercase">
                  Admin Portal
                </span>
              </div>
            </Link>
          </div>
          <div className="max-w-md">
            <h2 className="mb-6 text-5xl font-bold tracking-tight">
              Welcome <br />{" "}
              <span className="bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Back.
              </span>
            </h2>
            <p className="text-lg leading-relaxed font-light text-white/50">
              Secure access to the DCAS assessment management system. Monitor,
              analyze, and manage your cohorts effectively.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-white/20">
            <Lock className="h-3 w-3" />
            <span>SECURE CONNECTION ESTABLISHED</span>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="relative flex w-full items-center justify-center bg-[#0a0a0a] p-8 lg:w-1/2">
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="relative z-10 w-full max-w-md">
          <div className="mb-10 text-center lg:hidden">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                <div className="h-4 w-4 rounded-full bg-black" />
              </div>
              <span className="text-2xl font-bold tracking-tight">DCAS</span>
            </Link>
            <h1 className="text-xl font-medium text-white">Admin Login</h1>
          </div>

          <Card className="border border-white/10 bg-white/5 shadow-2xl shadow-black/50 backdrop-blur-xl">
            <CardHeader className="space-y-1 pb-6 text-left">
              <CardTitle className="text-xl font-semibold text-white">
                Sign in
              </CardTitle>
              <CardDescription className="text-white/40">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                    <p className="text-sm text-red-200">{error}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm text-white/80">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11 border-white/10 bg-black/20 text-white placeholder:text-white/20 focus:border-cyan-500/50"
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm text-white/80">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11 border-white/10 bg-black/20 text-white placeholder:text-white/20 focus:border-cyan-500/50"
                    autoComplete="current-password"
                  />
                </div>
                <Button
                  type="submit"
                  className="mt-2 h-12 w-full bg-white text-sm font-semibold text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:bg-white/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
