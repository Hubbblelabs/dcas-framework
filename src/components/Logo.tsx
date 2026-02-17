"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  textClassName?: string;
}

const sizeMap = {
  sm: "h-7 w-7",
  md: "h-9 w-9 sm:h-10 sm:w-10",
  lg: "h-12 w-12",
};

export function Logo({
  className,
  size = "md",
  showText = false,
  textClassName,
}: LogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/admin/logo")
      .then((r) => r.json())
      .then((data) => {
        if (data?.logoUrl) setLogoUrl(data.logoUrl);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const sizeClass = sizeMap[size];

  if (!loaded) {
    // Render default while loading to avoid layout shift
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div
          className={cn(
            sizeClass,
            "flex items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-lg sm:text-base",
          )}
        >
          D
        </div>
        {showText && (
          <span
            className={cn(
              "text-lg font-bold sm:text-xl",
              textClassName,
            )}
          >
            DCAS Assessment
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt="Logo"
          width={40}
          height={40}
          className={cn(sizeClass, "rounded-xl object-contain")}
          unoptimized
        />
      ) : (
        <div
          className={cn(
            sizeClass,
            "flex items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-lg sm:text-base",
          )}
        >
          D
        </div>
      )}
      {showText && (
        <span
          className={cn(
            "text-lg font-bold sm:text-xl",
            textClassName,
          )}
        >
          DCAS Assessment
        </span>
      )}
    </div>
  );
}
