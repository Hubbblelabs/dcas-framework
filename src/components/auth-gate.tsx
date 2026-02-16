"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/assessment/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
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
    <div className="flex min-h-dvh items-center justify-center bg-linear-to-br from-slate-50 via-white to-slate-100 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-linear-to-br from-indigo-500/10 to-purple-500/10 blur-3xl sm:-top-40 sm:-right-40 sm:h-80 sm:w-80" />
        <div className="absolute bottom-0 -left-20 h-40 w-40 rounded-full bg-linear-to-br from-emerald-500/10 to-teal-500/10 blur-3xl sm:-left-40 sm:h-80 sm:w-80" />
      </div>

      <div className="fixed top-4 right-4 z-20">
        <ModeToggle />
      </div>

      <Card className="animate-in fade-in zoom-in relative z-10 w-full max-w-md border-0 shadow-2xl duration-500">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Start Assessment
          </CardTitle>
          <CardDescription>
            Enter your details to begin your behavioral assessment journey
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
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
            {error && (
              <div className="text-center text-sm font-medium text-red-500">
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
  );
}
