import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "DCAS Behavioural Assessment | Discover Your Career Direction",
  description:
    "Take our comprehensive DCAS behavioural assessment to discover your personality style, unlock your strengths, and find career paths that align with your natural tendencies.",
  keywords: [
    "DCAS",
    "personality assessment",
    "career assessment",
    "behavioural analysis",
    "career guidance",
    "student assessment",
    "Driver",
    "Connector",
    "Anchor",
    "Strategist",
  ],
  authors: [{ name: "DCAS Assessment Platform" }],
  openGraph: {
    title: "DCAS Behavioural Assessment",
    description:
      "Discover your DCAS behavioural type and find your ideal career path",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DCAS Assessment",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="text-smooth font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
