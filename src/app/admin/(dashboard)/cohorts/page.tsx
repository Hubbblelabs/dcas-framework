"use client";

import { useEffect, useState, useCallback } from "react";
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
  ChevronLeft,
  ChevronRight,
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

type FilterStatus = "all" | "completed" | "not_attempted"; // Note: API expects 'Not Attempted' or 'Completed'

export default function UsersAssessmentsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filtering State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterBatch, setFilterBatch] = useState<string>("all");
  const [filterInstitution, setFilterInstitution] = useState<string>("all");

  const [availableBatches, setAvailableBatches] = useState<string[]>([]);
  const [availableInstitutions, setAvailableInstitutions] = useState<string[]>([]);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { getDCASTypeName, dcasColors: configColors } = useDCASConfig();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on search change
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", limit.toString());

      if (debouncedSearch) params.set("search", debouncedSearch);

      if (filterStatus !== "all") {
        // Map frontend filter value to API expected value
        if (filterStatus === "completed") params.set("status", "Completed");
        else if (filterStatus === "not_attempted") params.set("status", "Not Attempted");
      }

      if (filterBatch !== "all") params.set("batch", filterBatch);
      if (filterInstitution !== "all") params.set("institution", filterInstitution);

      params.set("sort", "created_at");
      params.set("order", "desc");

      const res = await fetch(`/api/users?${params.toString()}`);
      const data = await res.json();

      if (data.users) {
        setUsers(data.users);
        setTotalUsers(data.metadata.total);
        setTotalPages(data.metadata.pages);

        // Update facets if provided (and if we don't want to reset them based on current filter context)
        // Ideally facets should show ALL available options, regardless of current filters,
        // OR narrowing options. Here we take what API gives.
        if (data.metadata.facets) {
            // Only set if we haven't selected one? Or always update?
            // If I select "Batch A", do I want to see only "Batch A" in dropdown? No.
            // But API likely filters facets based on query.
            // For now, let's use what API returns, but maybe we should persist the initial load's facets?
            // Let's rely on API.
            setAvailableBatches(data.metadata.facets.batches || []);
            setAvailableInstitutions(data.metadata.facets.institutions || []);
        }
      } else {
        // Fallback for array response (should not happen with new API)
        if (Array.isArray(data)) {
            setUsers(data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, filterStatus, filterBatch, filterInstitution]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);


  // ---------- Actions ----------
  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    selected.size === users.length
      ? setSelected(new Set())
      : setSelected(new Set(users.map((u) => u._id)));
  };

  const handleSaveUser = async (updatedUser: any) => {
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });
      if (res.ok) {
        const saved = await res.json();
        // Optimistic update
        setUsers(users.map((u) => (u._id === saved._id ? { ...u, ...saved } : u)));
        setIsEditOpen(false);
        setEditingUser(null);
        fetchUsers(); // Refresh to be sure
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
        fetchUsers(); // Refresh to update counts
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
    // If selecting all, we might want to export ALL from server?
    // For now, export displayed/selected.
    const dataToExport =
      selected.size > 0
        ? users.filter((u) => selected.has(u._id))
        : users;

    const rows = dataToExport
      .map((u) => {
        const primary = u.score?.primary
          ? getDCASTypeName(u.score.primary as any)
          : "";
        const secondary = u.score?.secondary
          ? getDCASTypeName(u.score.secondary as any)
          : "";
        const date = u.completedAt
          ? new Date(u.completedAt).toLocaleDateString()
          : "";
        return `"${u.name}","${u.email}","${u.phone || ""}","${u.batch || ""}","${
          u.institution || ""
        }","${u.status}","${primary}","${secondary}","${date}"`;
      })
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users_assessments.csv";
    a.click();
  };

  // Helper for truncation
  const renderTruncatedCell = (text?: string, className = "max-w-[200px]") => {
    if (!text) return <span className="text-muted-foreground">—</span>;
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`truncate ${className}`}>{text}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{text}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const renderProfileBadge = (type: string) => {
    const colors = configColors[type as keyof typeof configColors];
    if (!colors) return <Badge variant="outline">{type}</Badge>;
    return (
      <Badge
        className="font-bold border"
        style={{
          backgroundColor: colors.bg,
          color: colors.text,
          borderColor: colors.border,
        }}
      >
        {type}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Cohort Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage users, track assessment progress, and view reports.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="default" className="bg-primary hover:bg-primary/90">
            <Users className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Students</CardTitle>
          <CardDescription>
            Total registered users: {totalUsers}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={filterStatus}
              onValueChange={(val) => { setFilterStatus(val); setPage(1); }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="not_attempted">Not Attempted</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterBatch}
              onValueChange={(val) => { setFilterBatch(val); setPage(1); }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                {availableBatches.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filterInstitution}
              onValueChange={(val) => { setFilterInstitution(val); setPage(1); }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Institution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Institutions</SelectItem>
                {availableInstitutions.map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead className="w-[50px] pl-4">
                        <Checkbox
                          checked={
                            users.length > 0 && selected.size === users.length
                          }
                          onCheckedChange={toggleAll}
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Institution</TableHead>
                      <TableHead>Profile</TableHead>
                      <TableHead className="text-right pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow 
                        key={u._id} 
                        className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                        onClick={() => {
                          setViewingUser(u);
                          setIsViewOpen(true);
                        }}
                      >
                        <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
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
                          {u.phone || <span className="text-muted-foreground">—</span>}
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
                              {u.score.primary && renderProfileBadge(u.score.primary)}
                              {u.score.secondary && renderProfileBadge(u.score.secondary)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm pl-2">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right pr-6" onClick={(e) => e.stopPropagation()}>
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
                                        ? `Assessment Completed on ${u.completedAt ? new Date(u.completedAt).toLocaleDateString() : 'Unknown date'}`
                                        : "Not Attempted"
                                      }
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
                                              const hostname = window.location.hostname.replace(/^admin\./,"");
                                              const port = window.location.port ? ":" + window.location.port : "";
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
                                          className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                                          onClick={() => {
                                            setEditingUser(u);
                                            setIsEditOpen(true);
                                          }}
                                        >
                                          <Pencil className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Edit User</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-slate-400 hover:text-destructive hover:bg-destructive/10"
                                          onClick={() => setDeleteUser(u)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Delete User</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {users.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={9}
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

              {/* Pagination Controls */}
              <div className="flex items-center justify-between px-4 py-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalUsers)} of {totalUsers} users
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="text-sm font-medium">
                    Page {page} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
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
