import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TraitResult } from "@/types";

interface ScoreCardProps {
    result: TraitResult;
    colorClass: string;
}

export function ScoreCard({ result, colorClass }: ScoreCardProps) {
    return (
        <Card className="h-full border-l-4 border-l-transparent" style={{ borderLeftColor: 'var(--color-border)' }}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-bold">{result.label}</CardTitle>
                    <span className={`text-sm font-semibold px-2 py-1 rounded-full bg-slate-100 ${colorClass}`}>
                        {result.level}
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold">{result.score}</span>
                        <Progress value={(result.score / 20) * 100} className="h-2" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {result.description}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
