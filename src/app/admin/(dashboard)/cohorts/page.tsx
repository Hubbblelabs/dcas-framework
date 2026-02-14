"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, Pencil, Trash2, Search, Users } from "lucide-react";
import { EditUserDialog } from "@/components/admin/EditUserDialog";

interface User {
    _id: string;
    name: string;
    email: string;
    batch?: string;
    institution?: string;
    createdAt?: string;
}

export default function CohortsPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetch("/api/users").then(r => r.json()).then(d => { setUsers(d); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.batch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.institution?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSaveUser = async (updatedUser: User) => {
        try {
            const res = await fetch("/api/users", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updatedUser) });
            if (res.ok) { const saved = await res.json(); setUsers(users.map(u => u._id === saved._id ? saved : u)); setIsEditOpen(false); setEditingUser(null); }
            else { const err = await res.json(); alert(`Failed: ${err.error || "Unknown error"}`); }
        } catch { alert("An error occurred."); }
    };

    const handleConfirmDelete = async () => {
        if (!deleteUser) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/users?id=${deleteUser._id}`, { method: "DELETE" });
            if (res.ok) { setUsers(users.filter(u => u._id !== deleteUser._id)); setDeleteUser(null); }
        } catch (e) { console.error("Delete failed", e); } finally { setIsDeleting(false); }
    };

    const uniqueBatches = [...new Set(users.map(u => u.batch).filter(Boolean))];
    const uniqueInstitutions = [...new Set(users.map(u => u.institution).filter(Boolean))];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div><h1 className="text-3xl font-bold tracking-tight">Cohorts & Users</h1><p className="text-muted-foreground">Manage students and their cohort information</p></div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Users className="h-8 w-8 text-cyan-500" /><div><p className="text-2xl font-bold">{users.length}</p><p className="text-sm text-muted-foreground">Total Users</p></div></div></CardContent></Card>
                <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Users className="h-8 w-8 text-green-500" /><div><p className="text-2xl font-bold">{uniqueBatches.length}</p><p className="text-sm text-muted-foreground">Unique Batches</p></div></div></CardContent></Card>
                <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Users className="h-8 w-8 text-purple-500" /><div><p className="text-2xl font-bold">{uniqueInstitutions.length}</p><p className="text-sm text-muted-foreground">Institutions</p></div></div></CardContent></Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div><CardTitle>All Users</CardTitle><CardDescription>Manage registered users and their cohort details</CardDescription></div>
                        <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" /></div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div> : (
                        <div className="rounded-md border border-border/40 overflow-hidden"><div className="overflow-x-auto">
                            <Table className="min-w-[700px]">
                                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Batch</TableHead><TableHead>Institution</TableHead><TableHead>Joined</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {filteredUsers.map((u) => (
                                        <TableRow key={u._id}>
                                            <TableCell className="font-medium">{u.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{u.email}</TableCell>
                                            <TableCell>{u.batch ? <Badge variant="outline">{u.batch}</Badge> : <span className="text-muted-foreground">—</span>}</TableCell>
                                            <TableCell>{u.institution || <span className="text-muted-foreground">—</span>}</TableCell>
                                            <TableCell className="text-muted-foreground">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="sm" onClick={() => { setEditingUser(u); setIsEditOpen(true); }}><Pencil className="h-4 w-4 text-green-600 dark:text-green-400" /></Button>
                                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteUser(u)}><Trash2 className="h-4 w-4" /></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredUsers.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{searchTerm ? "No users match your search." : "No users registered yet."}</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </div></div>
                    )}
                </CardContent>
            </Card>

            <EditUserDialog user={editingUser} open={isEditOpen} onOpenChange={setIsEditOpen} onSave={handleSaveUser} />
            <AlertDialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
                <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete User</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete &quot;{deleteUser?.name}&quot;? This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">{isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</> : "Delete"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
