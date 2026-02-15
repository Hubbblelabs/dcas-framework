"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Users, CheckCircle, Clock, FileQuestion, LayoutTemplate, Zap,
    RefreshCw, TrendingUp, Calendar, Activity, Target,
} from "lucide-react";
import { useDCASConfig } from "@/hooks/useDCASConfig";

interface DashboardStats {
    totalUsers: number;
    activeSessions: number;
    completedToday: number;
    completedThisWeek: number;
    completedThisMonth: number;
    totalQuestions: number;
    totalTemplates: number;
    liveAssessment: { name: string; questionCount: number } | null;
    dcasDistribution: { D: number; C: number; A: number; S: number };
    dcasPercentages: { D: number; C: number; A: number; S: number };
    recentSessions: Array<{
        id: string; studentName: string; email: string;
        primaryType: string; completedAt: string;
    }>;
    lastUpdated: string;
}

const DCAS_COLORS = {
    D: { bg: "bg-red-500", text: "text-red-600", light: "bg-red-100" },
    C: { bg: "bg-yellow-500", text: "text-yellow-600", light: "bg-yellow-100" },
    A: { bg: "bg-green-500", text: "text-green-600", light: "bg-green-100" },
    S: { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-100" },
};

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { dcasNames, getDCASTypeName } = useDCASConfig();

    const fetchStats = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const res = await fetch("/api/admin/stats");
            if (!res.ok) throw new Error("Failed");
            setStats(await res.json());
        } catch (err) {
            console.error("Failed to fetch stats", err);
        } finally { setLoading(false); setRefreshing(false); }
    }, []);

    useEffect(() => {
        fetchStats();
        const interval = setInterval(() => fetchStats(), 30000);
        return () => clearInterval(interval);
    }, [fetchStats]);

    const formatTime = (d: string) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const formatDate = (d: string) => {
        const date = new Date(d); const today = new Date();
        const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === today.toDateString()) return `Today at ${formatTime(d)}`;
        if (date.toDateString() === yesterday.toDateString()) return `Yesterday at ${formatTime(d)}`;
        return date.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-3 text-muted-foreground"><RefreshCw className="h-6 w-6 animate-spin" /><span>Loading dashboard...</span></div>
        </div>
    );

    if (!stats) return (
        <div className="text-center py-10">
            <p className="text-muted-foreground">Failed to load dashboard data.</p>
            <Button onClick={() => fetchStats()} className="mt-4">Retry</Button>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        <Activity className="h-4 w-4" />
                        Real-time analytics • Last updated: {formatTime(stats.lastUpdated)}
                    </p>
                </div>
                <Button variant="outline" onClick={() => fetchStats(true)} disabled={refreshing}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />Refresh
                </Button>
            </div>

            {stats.liveAssessment && (
                <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500 rounded-lg"><Zap className="h-5 w-5 text-white" /></div>
                                <div>
                                    <p className="font-semibold text-green-800">Live Assessment</p>
                                    <p className="text-sm text-green-600">{stats.liveAssessment.name} • {stats.liveAssessment.questionCount} questions</p>
                                </div>
                            </div>
                            <Badge className="bg-green-500 animate-pulse"><span className="mr-1">●</span> Active</Badge>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Students</CardTitle><Users className="h-4 w-4 text-blue-500" /></CardHeader>
                    <CardContent><div className="text-3xl font-bold">{stats.totalUsers}</div><p className="text-xs text-muted-foreground mt-1">Registered in system</p></CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Active Sessions</CardTitle><Clock className="h-4 w-4 text-orange-500" /></CardHeader>
                    <CardContent><div className="text-3xl font-bold">{stats.activeSessions}</div><p className="text-xs text-muted-foreground mt-1">Currently in progress</p></CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Completed Today</CardTitle><CheckCircle className="h-4 w-4 text-green-500" /></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-green-600">{stats.completedToday}</div><p className="text-xs text-muted-foreground mt-1">Assessments finished today</p></CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">This Week</CardTitle><TrendingUp className="h-4 w-4 text-purple-500" /></CardHeader>
                    <CardContent><div className="text-3xl font-bold">{stats.completedThisWeek}</div><p className="text-xs text-muted-foreground mt-1">Last 7 days</p></CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />DCAS Type Distribution</CardTitle>
                        <CardDescription>Personality type distribution across all completed assessments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {(Object.keys(DCAS_COLORS) as Array<keyof typeof DCAS_COLORS>).map((type) => (
                                <div key={type} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${DCAS_COLORS[type].bg}`} />
                                            <span className="font-medium">{type} - {getDCASTypeName(type)}</span>
                                        </div>
                                        <span className="text-muted-foreground">{stats.dcasDistribution[type]} ({stats.dcasPercentages[type]}%)</span>
                                    </div>
                                    <Progress value={stats.dcasPercentages[type]} className="h-2" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Quick Stats</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2"><FileQuestion className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Total Questions</span></div>
                            <span className="font-bold">{stats.totalQuestions}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2"><LayoutTemplate className="h-4 w-4 text-muted-foreground" /><span className="text-sm">Templates</span></div>
                            <span className="font-bold">{stats.totalTemplates}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-muted-foreground" /><span className="text-sm">This Month</span></div>
                            <span className="font-bold">{stats.completedThisMonth}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />Recent Completions</CardTitle>
                    <CardDescription>Latest assessment results</CardDescription>
                </CardHeader>
                <CardContent>
                    {stats.recentSessions.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No completed assessments yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {stats.recentSessions.map((session) => (
                                <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${session.primaryType !== "N/A" ? DCAS_COLORS[session.primaryType as keyof typeof DCAS_COLORS]?.bg || "bg-gray-500" : "bg-gray-500"}`}>
                                            {session.primaryType !== "N/A" ? getDCASTypeName(session.primaryType as any).charAt(0).toUpperCase() : "?"}
                                        </div>
                                        <div>
                                            <p className="font-medium">{session.studentName}</p>
                                            <p className="text-sm text-muted-foreground">{session.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="outline" className={session.primaryType !== "N/A" ? DCAS_COLORS[session.primaryType as keyof typeof DCAS_COLORS]?.light : ""}>
                                            {session.primaryType !== "N/A" ? getDCASTypeName(session.primaryType as any) : "Unknown"}
                                        </Badge>
                                        <p className="text-xs text-muted-foreground mt-1">{formatDate(session.completedAt)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
