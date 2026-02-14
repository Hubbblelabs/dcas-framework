"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: string
    onValueChange?: (value: string) => void
}

const RadioGroupContext = React.createContext<{
    value?: string
    onValueChange?: (value: string) => void
}>({})

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
    ({ className, value, onValueChange, ...props }, ref) => {
        return (
            <RadioGroupContext.Provider value={{ value, onValueChange }}>
                <div
                    ref={ref}
                    className={cn("grid gap-3", className)}
                    role="radiogroup"
                    {...props}
                />
            </RadioGroupContext.Provider>
        )
    }
)
RadioGroup.displayName = "RadioGroup"

interface RadioGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string
}

const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(
    ({ className, value, children, ...props }, ref) => {
        const context = React.useContext(RadioGroupContext)
        const isSelected = context.value === value

        return (
            <button
                ref={ref}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={cn(
                    "flex items-center justify-start gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200",
                    isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50 hover:bg-accent",
                    className
                )}
                onClick={() => context.onValueChange?.(value)}
                {...props}
            >
                <div
                    className={cn(
                        "h-5 w-5 shrink-0 rounded-full border-2 transition-all duration-200",
                        isSelected
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                    )}
                >
                    {isSelected && (
                        <div className="flex h-full w-full items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-white" />
                        </div>
                    )}
                </div>
                <span className="flex-1">{children}</span>
            </button>
        )
    }
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
