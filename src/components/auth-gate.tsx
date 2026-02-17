"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { ModeToggle } from "@/components/theme-toggle";

interface AuthGateProps {
  onAuthenticated: (userId: string, user: any) => void;
}

export function AuthGate({ onAuthenticated }: AuthGateProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [batch, setBatch] = useState("");
  const [institution, setInstitution] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    console.log("Submitting assessment user:", { name, email, phone, batch, institution });

    try {
      const res = await fetch("/api/assessment/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, batch, institution }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to authenticate");
      }

      const data = await res.json();
      onAuthenticated(data.userId, data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-linear-to-br from-indigo-500/10 to-purple-500/10 blur-3xl sm:-top-40 sm:-right-40 sm:h-80 sm:w-80" />
        <div className="absolute bottom-0 -left-20 h-40 w-40 rounded-full bg-linear-to-br from-emerald-500/10 to-teal-500/10 blur-3xl sm:-left-40 sm:h-80 sm:w-80" />
      </div>

      <header className="fixed top-0 right-0 left-0 z-20 border-b border-slate-200 bg-white/80 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <Link href="/">
            <Logo
              size="md"
              showText
              textClassName="bg-linear-to-r from-slate-800 to-slate-600 bg-clip-text text-lg font-bold text-transparent sm:text-xl dark:from-white dark:to-slate-300"
              iconClassName="rounded-full"
            />
          </Link>
          <div className="flex items-center gap-2">
            <ModeToggle />
          </div>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center p-4 pt-24 pb-8">
        <Card className="animate-in fade-in zoom-in relative z-10 w-full max-w-md border-0 shadow-2xl duration-500 md:max-w-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Start Assessment
            </CardTitle>
            <CardDescription>
              Enter your details to begin your behavioral assessment journey
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="grid gap-4 md:grid-cols-2 md:gap-6">
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Your Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="batch">Batch</Label>
                <Input
                  id="batch"
                  placeholder="e.g. 2024-A"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="institution">Institution</Label>
                <Input
                  id="institution"
                  placeholder="Your Institution"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                />
              </div>
              {error && (
                <div className="text-center text-sm font-medium text-red-500 md:col-span-2">
                  {error}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-linear-to-r from-indigo-600 to-purple-600 transition-all duration-300 hover:from-indigo-700 hover:to-purple-700"
                type="submit"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Signing in..." : "Start Assessment"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
