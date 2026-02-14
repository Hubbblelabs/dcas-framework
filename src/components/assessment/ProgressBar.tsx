import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
    current: number;
    total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
    const progress = (current / total) * 100;

    return (
        <div className="w-full space-y-2">
            <div className="flex justify-between text-sm font-medium text-muted-foreground">
                <span>Question {current} of {total}</span>
                <span>{Math.round(progress)}% completed</span>
            </div>
            <Progress value={progress} className="h-2 w-full" />
        </div>
    );
}
