import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
    return (
        <header className="border-b bg-white">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                        D
                    </div>
                    <span className="text-xl font-bold tracking-tight">DCAS Assessment</span>
                </Link>
                <nav className="flex items-center gap-4">
                    <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        Home
                    </Link>
                    <Button asChild variant="default" size="sm">
                        <Link href="/assessment">Start Assessment</Link>
                    </Button>
                </nav>
            </div>
        </header>
    );
}
