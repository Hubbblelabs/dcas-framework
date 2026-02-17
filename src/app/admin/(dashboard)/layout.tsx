"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SessionProvider } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "next-themes";
import { Logo } from "@/components/Logo";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <div className="flex min-h-screen w-full bg-white dark:bg-[#0a0a0a]">
          <AdminSidebar className="hidden md:flex" />
          <div className="flex h-screen flex-1 flex-col overflow-hidden">
            <header
              className="flex items-center justify-between border-b border-slate-200 bg-white p-4 text-slate-900 dark:border-[#1e1e1e] dark:bg-[#0a0a0a] dark:text-white md:hidden"
            >
              <Logo size="sm" showText textClassName="text-slate-900 dark:text-white text-base" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-white/10"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </header>
            {isMobileMenuOpen && (
              <div className="fixed inset-0 z-50 flex md:hidden">
                <div
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                <div
                  className="animate-in slide-in-from-left relative h-full w-64 shadow-xl duration-200"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 z-50 text-slate-600 hover:text-slate-900 dark:text-white/60 dark:hover:text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                  <AdminSidebar onClose={() => setIsMobileMenuOpen(false)} />
                </div>
              </div>
            )}
            <main className="flex-1 overflow-y-auto bg-slate-50 p-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100 md:p-6">
              {children}
            </main>
          </div>
        </div>
      </ThemeProvider>
    </SessionProvider>
  );
}
