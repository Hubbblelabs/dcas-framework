"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
            const result = await signIn("credentials", { email, password, redirect: false });
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
        <div className="min-h-screen bg-[#0a0a0a] text-white flex overflow-hidden">
            {/* Left Column */}
            <div className="hidden lg:flex w-1/2 relative bg-black overflow-hidden flex-col justify-between p-12 border-r border-white/5">
                <div className="absolute inset-0 z-0 opacity-40">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-neutral-900/50 via-[#0a0a0a] to-[#0a0a0a]" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-size-[40px_40px]" />
                </div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                        <Link href="/" className="inline-flex items-center gap-3 group">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-shadow group-hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                                <div className="w-5 h-5 bg-black rounded-full" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold tracking-tight text-white">DCAS</span>
                                <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">Admin Portal</span>
                            </div>
                        </Link>
                    </div>
                    <div className="max-w-md">
                        <h2 className="text-5xl font-bold mb-6 tracking-tight">
                            Welcome <br /> <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500">Back.</span>
                        </h2>
                        <p className="text-lg text-white/50 font-light leading-relaxed">
                            Secure access to the DCAS assessment management system. Monitor, analyze, and manage your cohorts effectively.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/20 font-mono">
                        <Lock className="w-3 h-3" />
                        <span>SECURE CONNECTION ESTABLISHED</span>
                    </div>
                </div>
            </div>

            {/* Right Column */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#0a0a0a] relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="w-full max-w-md relative z-10">
                    <div className="text-center mb-10 lg:hidden">
                        <Link href="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                                <div className="w-4 h-4 bg-black rounded-full" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight">DCAS</span>
                        </Link>
                        <h1 className="text-xl font-medium text-white">Admin Login</h1>
                    </div>

                    <Card className="border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/50">
                        <CardHeader className="space-y-1 pb-6 text-left">
                            <CardTitle className="text-xl text-white font-semibold">Sign in</CardTitle>
                            <CardDescription className="text-white/40">Enter your credentials to access your account</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-200">{error}</p>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-white/80 text-sm">Email</Label>
                                    <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} className="bg-black/20 border-white/10 text-white placeholder:text-white/20 focus:border-cyan-500/50 h-11" autoComplete="email" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-white/80 text-sm">Password</Label>
                                    <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} className="bg-black/20 border-white/10 text-white placeholder:text-white/20 focus:border-cyan-500/50 h-11" autoComplete="current-password" />
                                </div>
                                <Button type="submit" className="w-full h-12 text-sm font-semibold bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all mt-2" disabled={isLoading}>
                                    {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</>) : "Sign In"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
