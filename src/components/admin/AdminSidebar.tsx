"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileQuestion,
  ClipboardList,
  BarChart,
  Settings,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Logo } from "@/components/Logo";
import { useEffect, useState } from "react";

const sidebarItems = [
  { title: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Cohorts & Users", href: "/admin/cohorts", icon: Users },
  { title: "Question Bank", href: "/admin/questions", icon: FileQuestion },
  { title: "Assessments", href: "/admin/assessments", icon: ClipboardList },
  { title: "Reports", href: "/admin/reports", icon: BarChart },
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

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={cn(
        "flex h-screen w-64 flex-col border-r bg-sidebar text-sidebar-foreground dark:border-sidebar-border dark:bg-sidebar",
        "border-slate-200 bg-white dark:border-[#1e1e1e] dark:bg-[#0a0a0a]",
        className,
      )}
    >
      <div
        className="flex h-16 items-center border-b border-slate-200 px-6 font-semibold text-slate-900 dark:border-[#1e1e1e] dark:text-white"
      >
        <Logo size="sm" showText textClassName="text-slate-900 dark:text-white text-base" />
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
      <div
        className="mt-auto space-y-1 border-t border-slate-200 p-4 dark:border-[#1e1e1e]"
      >
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute ml-0 h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="ml-4">{mounted ? (theme === "dark" ? "Light Mode" : "Dark Mode") : "Toggle Theme"}</span>
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
  );
}
