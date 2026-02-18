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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Pencil,
  Trash2,
  Search,
  Users,
  Download,
  ExternalLink,
  Building2,
  GraduationCap,
  CheckCircle,
  Clock,
} from "lucide-react";
import { EditUserDialog } from "@/components/admin/EditUserDialog";
import { UserDetailsDialog } from "@/components/admin/UserDetailsDialog";
import { useDCASConfig } from "@/hooks/useDCASConfig";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  batch?: string;
  institution?: string;
  createdAt?: string;
  latestReportId?: string;
  score?: { primary: string; secondary?: string } | null;
  completedAt?: string | null;
  status: "Completed" | "Not Attempted";
}

type FilterStatus = "all" | "completed" | "not_attempted";

export default function UsersAssessmentsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    getDCASTypeName,
    getDCASTypeSymbol,
    dcasColors: configColors,
  } = useDCASConfig();

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((d) => {
        setUsers(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // ---------- Derived ----------
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.batch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.institution?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === "completed") return u.status === "Completed";
    if (filterStatus === "not_attempted") return u.status === "Not Attempted";
    return true;
  });

  const uniqueBatches = [...new Set(users.map((u) => u.batch).filter(Boolean))];
  const uniqueInstitutions = [
    ...new Set(users.map((u) => u.institution).filter(Boolean)),
  ];
  const completedCount = users.filter((u) => u.status === "Completed").length;

  // ---------- Selection ----------
  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    selected.size === filteredUsers.length
      ? setSelected(new Set())
      : setSelected(new Set(filteredUsers.map((u) => u._id)));
  };

  // ---------- Actions ----------
  const handleSaveUser = async (updatedUser: any) => {
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });
      if (res.ok) {
        const saved = await res.json();
        setUsers(
          users.map((u) => (u._id === saved._id ? { ...u, ...saved } : u)),
        );
        setIsEditOpen(false);
        setEditingUser(null);
      } else {
        const err = await res.json();
        alert(`Failed: ${err.error || "Unknown error"}`);
      }
    } catch {
      alert("An error occurred.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteUser) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/users?id=${deleteUser._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setUsers(users.filter((u) => u._id !== deleteUser._id));
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(deleteUser._id);
          return next;
        });
        setDeleteUser(null);
      }
    } catch (e) {
      console.error("Delete failed", e);
    } finally {
      setIsDeleting(false);
    }
  };

  const exportCSV = () => {
    const header =
      "Name,Email,Phone,Batch,Institution,Status,Primary Profile,Secondary Profile,Completed At\n";
    const dataToExport =
      selected.size > 0
        ? filteredUsers.filter((u) => selected.has(u._id))
        : filteredUsers;
    const rows = dataToExport
      .map((u) => {
        const primary = u.score?.primary
          ? getDCASTypeName(u.score.primary as any)
          : "";
        const secondary = u.score?.secondary
          ? getDCASTypeName(u.score.secondary as any)
          : "";
        const completed = u.completedAt
          ? new Date(u.completedAt).toLocaleDateString()
          : "";
        return `"${u.name}","${u.email}","${u.phone || ""}","${u.batch || ""}","${u.institution || ""}","${u.status}","${primary}","${secondary}","${completed}"`;
      })
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users-assessments.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper to render DCASType Badge with Symbol
  const renderProfileBadge = (type: string) => {
    const name = getDCASTypeName(type as any);
    const symbol = getDCASTypeSymbol(type as any);
    const color =
      configColors[type as keyof typeof configColors]?.primary || "#64748b";

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
              style={{ backgroundColor: color }}
            >
              {symbol}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{name}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Helper for truncated text with tooltip
  const renderTruncatedCell = (
    text: string | undefined,
    maxWidth: string = "max-w-[150px]",
  ) => {
    if (!text) return <span className="text-muted-foreground">—</span>;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`truncate ${maxWidth} text-sm`}>{text}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{text}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // ---------- Render ----------
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Users &amp; Assessments
          </h1>
          <p className="text-muted-foreground">
            Manage users and view assessment results in one place
          </p>
        </div>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <Badge variant="secondary" className="px-3 py-1.5 text-sm">
              {selected.size} selected
            </Badge>
          )}
          <Button
            variant="outline"
            onClick={exportCSV}
            disabled={filteredUsers.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            {selected.size > 0
              ? `Export Selected (${selected.size})`
              : "Export CSV"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-cyan-100 p-2 dark:bg-cyan-900/30">
                <Users className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-muted-foreground text-xs">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
                <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{uniqueBatches.length}</p>
                <p className="text-muted-foreground text-xs">Unique Batches</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/30">
                <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {uniqueInstitutions.length}
                </p>
                <p className="text-muted-foreground text-xs">Institutions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900/30">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-muted-foreground text-xs">
                  Completed Assessments
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                {filteredUsers.length} of {users.length} users
                {filterStatus !== "all" &&
                  ` · Filtered: ${filterStatus === "completed" ? "Completed" : "Not Attempted"}`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select
                value={filterStatus}
                onValueChange={(v) => {
                  setFilterStatus(v as FilterStatus);
                  setSelected(new Set());
                }}
              >
                <SelectTrigger className="h-9 w-[170px] text-sm">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="completed">Completed Only</SelectItem>
                  <SelectItem value="not_attempted">Not Attempted</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-64">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelected(new Set());
                  }}
                  className="h-9 pl-9 text-sm"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="border-t">
              <div className="overflow-x-auto">
                <Table className="min-w-[1000px]">
                  <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                    <TableRow>
                      <TableHead className="w-[40px] pl-4">
                        <Checkbox
                          checked={
                            selected.size === filteredUsers.length &&
                            filteredUsers.length > 0
                          }
                          onCheckedChange={toggleAll}
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Institution</TableHead>
                      <TableHead>Profile Result</TableHead>
                      <TableHead className="pr-6 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow
                        key={u._id}
                        className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
                        onClick={() => {
                          setViewingUser(u);
                          setIsViewOpen(true);
                        }}
                      >
                        <TableCell
                          className="pl-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={selected.has(u._id)}
                            onCheckedChange={() => toggleSelect(u._id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                          {u.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {renderTruncatedCell(u.email)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {u.phone || (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {u.batch ? (
                            renderTruncatedCell(u.batch, "max-w-[120px]")
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {renderTruncatedCell(u.institution, "max-w-[150px]")}
                        </TableCell>
                        <TableCell>
                          {u.score ? (
                            <div className="flex gap-2">
                              {u.score.primary &&
                                renderProfileBadge(u.score.primary)}
                              {u.score.secondary &&
                                renderProfileBadge(u.score.secondary)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground pl-2 text-sm">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell
                          className="pr-6 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-2">
                            {/* Status Indicator */}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center justify-center">
                                    {u.status === "Completed" ? (
                                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                                    ) : (
                                      <Clock className="h-5 w-5 text-slate-300 dark:text-slate-600" />
                                    )}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {u.status === "Completed"
                                      ? `Assessment Completed on ${u.completedAt ? new Date(u.completedAt).toLocaleDateString() : "Unknown date"}`
                                      : "Not Attempted"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            {u.status === "Completed" && u.latestReportId && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                      onClick={() => {
                                        const hostname =
                                          window.location.hostname.replace(
                                            /^admin\./,
                                            "",
                                          );
                                        const port = window.location.port
                                          ? ":" + window.location.port
                                          : "";
                                        const url = `${window.location.protocol}//${hostname}${port}/results/${u.latestReportId}`;
                                        window.open(url, "_blank");
                                      }}
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>View Assessment Report</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800"
                                    onClick={() => {
                                      setEditingUser(u);
                                      setIsEditOpen(true);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit User</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:text-destructive hover:bg-destructive/10 h-8 w-8 text-slate-400"
                                    onClick={() => setDeleteUser(u)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete User</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={9} // Adjusted colspan since one column was removed
                          className="text-muted-foreground py-12 text-center"
                        >
                          {searchTerm || filterStatus !== "all"
                            ? "No users match your filters."
                            : "No users registered yet."}
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

      {/* Edit Dialog */}
      <EditUserDialog
        user={editingUser}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSave={handleSaveUser}
      />

      {/* View User Details Dialog */}
      <UserDetailsDialog
        user={viewingUser}
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteUser}
        onOpenChange={(open) => !open && setDeleteUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteUser?.name}&quot;?
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
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
