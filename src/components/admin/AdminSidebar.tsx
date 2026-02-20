"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileQuestion,
  ClipboardList,
  Settings,
  LogOut,
  Moon,
  Sun,
  ShieldCheck,
  KeyRound,
  Shield,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Logo } from "@/components/Logo";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const sidebarItems = [
  { title: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Users & Assessments", href: "/admin/cohorts", icon: Users },
  { title: "Question Bank", href: "/admin/questions", icon: FileQuestion },
  { title: "Assessments", href: "/admin/assessments", icon: ClipboardList },
  {
    title: "Manage Admins",
    href: "/admin/admins",
    icon: ShieldCheck,
  },
  {
    title: "DCAS Configuration",
    href: "/admin/dcas-configuration",
    icon: Settings,
  },
];

export function AdminSidebar({
  className,
  onClose,
}: {
  className?: string;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();

  // Change password dialog state
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || "Failed to change password");
      } else {
        setPasswordSuccess(true);
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => {
          setIsPasswordOpen(false);
          setPasswordSuccess(false);
        }, 1500);
      }
    } catch {
      setPasswordError("An unexpected error occurred");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const roleLabel =
    session?.user?.role === "superadmin" ? "Super Admin" : "Admin";
  const RoleIcon = session?.user?.role === "superadmin" ? ShieldAlert : Shield;

  return (
    <div
      className={cn(
        "bg-sidebar text-sidebar-foreground dark:border-sidebar-border dark:bg-sidebar flex h-screen w-64 flex-col border-r",
        "border-slate-200 bg-white dark:border-[#1e1e1e] dark:bg-[#0a0a0a]",
        className,
      )}
    >
      <div className="flex h-16 items-center border-b border-slate-200 px-6 font-semibold text-slate-900 dark:border-[#1e1e1e] dark:text-white">
        <Logo
          size="md"
          showText
          textClassName="text-slate-900 dark:text-white text-base"
          iconClassName="rounded-full"
        />
      </div>
      <div className="flex-1 overflow-auto py-6">
        <nav className="grid items-start px-4 text-sm font-medium">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white",
                pathname === item.href &&
                  "bg-cyan-50 text-cyan-700 hover:bg-cyan-100 hover:text-cyan-800 dark:bg-cyan-500/10 dark:text-cyan-400 dark:hover:bg-cyan-500/20 dark:hover:text-cyan-300",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="mt-auto border-t border-slate-200 dark:border-[#1e1e1e]">
        {/* Profile card */}
        {session?.user && (
          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-[#1e1e1e]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400">
              <RoleIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {session.user.name}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {session.user.email}
              </p>
              <span
                className={cn(
                  "mt-0.5 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium",
                  session.user.role === "superadmin"
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                )}
              >
                {roleLabel}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-1 p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute ml-0 h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span>
              {mounted
                ? theme === "dark"
                  ? "Light Mode"
                  : "Dark Mode"
                : "Toggle Theme"}
            </span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white"
            onClick={() => {
              setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              });
              setPasswordError("");
              setPasswordSuccess(false);
              setIsPasswordOpen(true);
            }}
          >
            <KeyRound className="h-4 w-4" />
            Change Password
          </Button>
          <Button
            variant="ghost"
            className="hover:text-destructive hover:bg-destructive/10 w-full justify-start gap-3 text-slate-600 dark:text-white/60"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog
        open={isPasswordOpen}
        onOpenChange={(open) => {
          setIsPasswordOpen(open);
          if (!open) {
            setPasswordError("");
            setPasswordSuccess(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordChange}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  required
                  autoComplete="current-password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  required
                  autoComplete="new-password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  autoComplete="new-password"
                />
              </div>
              {passwordError && (
                <p className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
                  {passwordError}
                </p>
              )}
              {passwordSuccess && (
                <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  Password changed successfully!
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasswordOpen(false)}
                disabled={isChangingPassword}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isChangingPassword || passwordSuccess}
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
