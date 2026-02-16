"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SessionProvider } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "next-themes";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <SessionProvider>
      <div className="flex min-h-screen w-full bg-[#0a0a0a]">
        <AdminSidebar className="hidden md:flex" />
        <div className="flex h-screen flex-1 flex-col overflow-hidden">
          <header
            className="flex items-center justify-between border-b border-[#1e1e1e] bg-[#0a0a0a] p-4 text-white md:hidden"
            style={{ borderColor: "#1e1e1e" }}
          >
            <div className="flex items-center gap-2 font-semibold">
              <div className="h-2 w-2 rounded-full bg-cyan-400" />
              DCAS Admin
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-white hover:bg-white/10"
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
                className="animate-in slide-in-from-left relative h-full w-64 border-r border-[#1e1e1e] bg-[#0a0a0a] shadow-xl duration-200"
                style={{ borderColor: "#1e1e1e" }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 z-50 text-white/60 hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
                <AdminSidebar onClose={() => setIsMobileMenuOpen(false)} />
              </div>
            </div>
          )}
          <ThemeProvider
            forcedTheme="light"
            attribute="class"
            enableSystem={false}
          >
            <main className="theme-light-forced flex-1 overflow-y-auto bg-slate-50 p-4 text-slate-900 md:p-6">
              {children}
            </main>
          </ThemeProvider>
        </div>
      </div>
    </SessionProvider>
  );
}
