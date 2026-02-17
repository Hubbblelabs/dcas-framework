"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Trash2, Download, ExternalLink } from "lucide-react";
import { useDCASConfig } from "@/hooks/useDCASConfig";
import Link from "next/link";

interface ReportSession {
  _id: string;
  user?: { name: string; email: string };
  guestName?: string;
  score?: {
    primary: string;
    secondary: string;
    D: number;
    C: number;
    A: number;
    S: number;
  };
  completedAt: string;
}

const dcasBadgeColors: Record<string, string> = {
  D: "bg-red-500",
  C: "bg-amber-500",
  A: "bg-emerald-500",
  S: "bg-blue-500",
};

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { getDCASTypeName, dcasColors: configColors } = useDCASConfig();

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((d) => {
        setReports(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };
  const toggleAll = () => {
    selected.size === reports.length
      ? setSelected(new Set())
      : setSelected(new Set(reports.map((r) => r._id)));
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      if (res.ok) {
        setReports(reports.filter((r) => !selected.has(r._id)));
        setSelected(new Set());
        setIsDeleteOpen(false);
      }
    } catch (e) {
      console.error("Delete failed", e);
    } finally {
      setIsDeleting(false);
    }
  };

  const exportCSV = () => {
    const header =
      "Name,Email,Driver,Connector,Anchor,Strategist,Primary,Secondary,Completed\n";
    const dataToExport = selected.size > 0 ? reports.filter((r) => selected.has(r._id)) : reports;
    const rows = dataToExport
      .map((r) => {
        const name = r.user?.name || r.guestName || "Guest";
        const email = r.user?.email || "";
        return `"${name}","${email}",${r.score?.D || 0},${r.score?.C || 0},${r.score?.A || 0},${r.score?.S || 0},"${getDCASTypeName((r.score?.primary || "D") as any)}","${getDCASTypeName((r.score?.secondary || "C") as any)}","${new Date(r.completedAt).toLocaleDateString()}"`;
      })
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dcas-reports.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            View completed assessment results and export data
          </p>
        </div>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <Button variant="destructive" onClick={() => setIsDeleteOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete ({selected.size})
            </Button>
          )}
          <Button
            variant="outline"
            onClick={exportCSV}
            disabled={reports.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            {selected.size > 0 ? `Export Selected (${selected.size})` : "Export CSV"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Completed Assessments</CardTitle>
          <CardDescription>{reports.length} results available</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="border-border/40 overflow-hidden rounded-md border">
              <div className="overflow-x-auto">
                <Table className="min-w-[700px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">
                        <Checkbox
                          checked={
                            selected.size === reports.length &&
                            reports.length > 0
                          }
                          onCheckedChange={toggleAll}
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Profile</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((r) => (
                      <TableRow key={r._id}>
                        <TableCell>
                          <Checkbox
                            checked={selected.has(r._id)}
                            onCheckedChange={() => toggleSelect(r._id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {r.user?.name || r.guestName || "Guest"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {r.user?.email || "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {r.score?.primary && (
                              <Badge
                                className="text-white"
                                style={{ backgroundColor: configColors[r.score.primary as keyof typeof configColors]?.primary || undefined }}
                              >
                                {getDCASTypeName(r.score.primary as any)}
                              </Badge>
                            )}
                            {r.score?.secondary && (
                              <Badge variant="outline">
                                {getDCASTypeName(r.score.secondary as any)}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(r.completedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/results/${r._id}`} target="_blank">
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="mr-1 h-3 w-3" />
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                    {reports.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-muted-foreground py-8 text-center"
                        >
                          No completed assessments yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reports</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selected.size} report(s)? This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
