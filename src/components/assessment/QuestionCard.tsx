import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Question, Option } from "@/types";

interface QuestionCardProps {
    question: Question;
    selectedOptionId: string | null;
    onSelectOption: (optionLabel: string) => void;
}

export function QuestionCard({ question, selectedOptionId, onSelectOption }: QuestionCardProps) {
    return (
        <Card className="w-full max-w-2xl mx-auto shadow-lg border-t-4 border-t-primary animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
                <CardTitle className="text-xl md:text-2xl leading-normal">
                    {question.id}. {question.text}
                </CardTitle>
                <CardDescription>
                    Select the option that best describes you.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <RadioGroup
                    value={selectedOptionId || ""}
                    onValueChange={onSelectOption}
                    className="space-y-4"
                >
                    {question.options.map((option) => (
                        <div
                            key={option.label}
                            className={`flex items-start space-x-3 p-4 rounded-lg border transition-all cursor-pointer hover:bg-accent hover:border-primary/50 ${selectedOptionId === option.label
                                    ? "bg-accent border-primary ring-1 ring-primary"
                                    : "bg-card border-input"
                                }`}
                            onClick={() => onSelectOption(option.label)}
                        >
                            <RadioGroupItem value={option.label} id={option.label} className="mt-1" />
                            <Label
                                htmlFor={option.label}
                                className="text-base font-normal leading-relaxed cursor-pointer flex-1"
                            >
                                {/* Clean up the text to remove trailing parens like (D) if they exist */}
                                <span className="font-semibold text-primary/80 mr-2">{option.label}.</span>
                                {option.text.replace(/\s*\([DCAS]\)\s*$/i, "")}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </CardContent>
        </Card>
    );
}
