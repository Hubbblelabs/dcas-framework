import Link from "next/link";
import { Logo } from "@/components/Logo";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-slate-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-950">
            <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-6 lg:flex-row lg:justify-between lg:gap-4 lg:px-8">
                {/* Brand */}
                <div className="flex items-center justify-center lg:justify-start">
                    <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                        <Logo
                            size="sm"
                            showText
                            textClassName="bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-base font-bold text-transparent sm:text-lg dark:from-white dark:to-slate-300"
                        />
                    </Link>
                </div>

              {/* Credits - Center */}

                {/* Copyright - Right */}
                <div className="flex items-center justify-center lg:justify-end">
                    <p className="text-center text-sm text-slate-500 lg:text-right dark:text-slate-400">
                        &copy; {currentYear} DCAS Behavioural Assessment.
                    </p>
                </div>
            </div>
        </footer>
    );
}
