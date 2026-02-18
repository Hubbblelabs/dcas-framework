"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  indicatorClassName?: string;
  indicatorStyle?: React.CSSProperties;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value = 0,
      max = 100,
      indicatorClassName,
      indicatorStyle,
      ...props
    },
    ref,
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div
        ref={ref}
        className={cn(
          "bg-secondary relative h-3 w-full overflow-hidden rounded-full",
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            "bg-primary h-full w-full flex-1 transition-all duration-500 ease-out",
            indicatorClassName,
          )}
          style={{
            transform: `translateX(-${100 - percentage}%)`,
            ...indicatorStyle,
          }}
        />
      </div>
    );
  },
);
Progress.displayName = "Progress";

export { Progress };
