import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface QuestionOption {
  label: string;
  text: string;
  dcas_type: string;
}
interface Question {
  _id: string;
  text: string;
  options: QuestionOption[];
}
interface Template {
  _id: string;
  name: string;
  questions?: Question[];
  settings: { language?: string; randomized?: boolean; [key: string]: any };
}

interface PreviewAssessmentDialogProps {
  assessment: Template | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PreviewAssessmentDialog({
  assessment,
  open,
  onOpenChange,
}: PreviewAssessmentDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fullQuestions, setFullQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (open && assessment) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);
      fetch(`/api/assessments/${assessment._id}`)
        .then((r) => r.json())
        .then((d) => {
          setFullQuestions(d.questions || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
      setCurrentIndex(0);
    }
  }, [open, assessment]);

  if (!assessment) return null;
  const current = fullQuestions[currentIndex];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Preview: {assessment.name}</DialogTitle>
          <DialogDescription>
            Previewing {fullQuestions.length} questions.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-[300px] py-6">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : fullQuestions.length === 0 ? (
            <div className="text-muted-foreground text-center">
              No questions found in this template.
            </div>
          ) : current ? (
            <div className="space-y-6">
              <span className="text-muted-foreground text-sm font-medium">
                Question {currentIndex + 1} of {fullQuestions.length}
              </span>
              <h3 className="text-lg font-semibold">{current.text}</h3>
              <RadioGroup className="space-y-3">
                {current.options?.map((opt) => (
                  <div
                    key={opt.label}
                    className="pointer-events-none flex items-start space-x-3 rounded-lg border p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    <RadioGroupItem
                      value={opt.label}
                      id={`preview-${opt.label}`}
                    />
                    <Label
                      htmlFor={`preview-${opt.label}`}
                      className="flex-1 cursor-pointer font-normal"
                    >
                      <span className="mr-2 font-bold">{opt.label}.</span>
                      {opt.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ) : (
            <div className="text-destructive text-center">
              Error loading question.
            </div>
          )}
        </div>
        <DialogFooter className="flex w-full items-center justify-between sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => setCurrentIndex((i) => i - 1)}
            disabled={currentIndex === 0 || loading}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button
            variant="ghost"
            onClick={() => setCurrentIndex((i) => i + 1)}
            disabled={currentIndex === fullQuestions.length - 1 || loading}
          >
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
