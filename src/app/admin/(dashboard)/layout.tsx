"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SessionProvider } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <SessionProvider>
            <div className="flex min-h-screen w-full bg-[#0a0a0a]">
                <AdminSidebar className="hidden md:flex" />
                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    <header className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#0a0a0a] text-white">
                        <div className="flex items-center gap-2 font-semibold">
                            <div className="h-2 w-2 rounded-full bg-cyan-400" />
                            DCAS Admin
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)} className="text-white hover:bg-white/10">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </header>
                    {isMobileMenuOpen && (
                        <div className="fixed inset-0 z-50 md:hidden flex">
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                            <div className="relative w-64 h-full bg-[#0a0a0a] border-r border-white/10 shadow-xl animate-in slide-in-from-left duration-200">
                                <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white/60 hover:text-white z-50" onClick={() => setIsMobileMenuOpen(false)}>
                                    <X className="h-5 w-5" />
                                </Button>
                                <AdminSidebar onClose={() => setIsMobileMenuOpen(false)} />
                            </div>
                        </div>
                    )}
                    <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">{children}</main>
                </div>
            </div>
        </SessionProvider>
    );
}
