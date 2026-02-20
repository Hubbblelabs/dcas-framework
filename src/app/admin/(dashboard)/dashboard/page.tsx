"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  CheckCircle,
  Clock,
  FileQuestion,
  LayoutTemplate,
  Zap,
  RefreshCw,
  TrendingUp,
  Calendar,
  Activity,
  Target,
} from "lucide-react";
import { useDCASConfig } from "@/hooks/useDCASConfig";
import { DCASType } from "@/lib/dcas/scoring";

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
    id: string;
    studentName: string;
    email: string;
    primaryType: string;
    completedAt: string;
  }>;
  lastUpdated: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { getDCASTypeName, getDCASTypeSymbol, dcasColors } = useDCASConfig();

  const fetchStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          `Failed to fetch stats: ${res.status} ${res.statusText} - ${JSON.stringify(errorData)}`,
        );
      }
      setStats(await res.json());
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => fetchStats(), 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDate = (d: string) => {
    const date = new Date(d);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString())
      return `Today at ${formatTime(d)}`;
    if (date.toDateString() === yesterday.toDateString())
      return `Yesterday at ${formatTime(d)}`;
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading)
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-muted-foreground flex items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );

  if (!stats)
    return (
      <div className="py-10 text-center">
        <p className="text-muted-foreground">Failed to load dashboard data.</p>
        <Button onClick={() => fetchStats()} className="mt-4">
          Retry
        </Button>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Real-time analytics • Last updated: {formatTime(stats.lastUpdated)}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => fetchStats(true)}
          disabled={refreshing}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {stats.liveAssessment && (
        <Card className="border-green-200 bg-linear-to-r from-green-50 to-emerald-50 dark:border-green-900/50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-500 p-2">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-300">
                    Live Assessment
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {stats.liveAssessment.name} •{" "}
                    {stats.liveAssessment.questionCount} questions
                  </p>
                </div>
              </div>
              <Badge className="animate-pulse bg-green-500 text-white">
                <span className="mr-1">●</span> Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              Registered in system
            </p>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Sessions
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeSessions}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              Currently in progress
            </p>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Today
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats.completedToday}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Assessments finished today
            </p>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.completedThisWeek}</div>
            <p className="text-muted-foreground mt-1 text-xs">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              DCAS Type Distribution
            </CardTitle>
            <CardDescription>
              Behavioural type distribution across all completed assessments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(["D", "C", "A", "S"] as const).map((type) => (
                <div key={type} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: dcasColors[type].primary }}
                      />
                      <span className="font-medium">
                        {getDCASTypeSymbol(type)} - {getDCASTypeName(type)}
                      </span>
                    </div>
                    <span className="text-muted-foreground">
                      {stats.dcasDistribution[type]} (
                      {stats.dcasPercentages[type]}%)
                    </span>
                  </div>
                  <Progress
                    value={stats.dcasPercentages[type]}
                    className="h-2"
                    indicatorStyle={{
                      backgroundColor: dcasColors[type].primary,
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
              <div className="flex items-center gap-2">
                <FileQuestion className="text-muted-foreground h-4 w-4" />
                <span className="text-sm">Total Questions</span>
              </div>
              <span className="font-bold">{stats.totalQuestions}</span>
            </div>
            <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
              <div className="flex items-center gap-2">
                <LayoutTemplate className="text-muted-foreground h-4 w-4" />
                <span className="text-sm">Templates</span>
              </div>
              <span className="font-bold">{stats.totalTemplates}</span>
            </div>
            <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-muted-foreground h-4 w-4" />
                <span className="text-sm">This Month</span>
              </div>
              <span className="font-bold">{stats.completedThisMonth}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Completions
          </CardTitle>
          <CardDescription>Latest assessment results</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentSessions.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No completed assessments yet.
            </p>
          ) : (
            <div className="space-y-3">
              {stats.recentSessions.map((session) => {
                const type = session.primaryType as DCASType;
                const hasScore = session.primaryType !== "N/A";
                const color = hasScore ? dcasColors[type].primary : "#94a3b8";
                const lightBg = hasScore ? dcasColors[type].light : "#f1f5f9";

                return (
                  <div
                    key={session.id}
                    className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-white"
                        style={{ backgroundColor: color }}
                      >
                        {hasScore ? getDCASTypeSymbol(type) : "?"}
                      </div>
                      <div>
                        <p className="font-medium">{session.studentName}</p>
                        <p className="text-muted-foreground text-sm">
                          {session.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        style={{
                          backgroundColor: lightBg,
                          color: color,
                          borderColor: color + "40",
                        }}
                      >
                        {hasScore ? getDCASTypeName(type) : "Unknown"}
                      </Badge>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {formatDate(session.completedAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
