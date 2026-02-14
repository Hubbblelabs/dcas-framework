import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useDCASConfig } from "@/hooks/useDCASConfig";

interface Option {
    label: string;
    text: string;
    dcas_type: "D" | "C" | "A" | "S";
}

interface Question {
    _id: string;
    text: string;
    options: Option[];
    active: boolean;
    [key: string]: any;
}

interface EditQuestionDialogProps {
    question: Question | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (question: Question) => void;
}

export function EditQuestionDialog({ question, open, onOpenChange, onSave }: EditQuestionDialogProps) {
    const [editedQuestion, setEditedQuestion] = useState<Question | null>(question);
    const { getDCASTypeName } = useDCASConfig();

    if (question && editedQuestion?._id !== question._id) {
        setEditedQuestion(question);
    }

    const handleSave = () => {
        if (editedQuestion) { onSave(editedQuestion); onOpenChange(false); }
    };

    if (!editedQuestion) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Question</DialogTitle>
                    <DialogDescription>Modify the question text and options.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="question-text">Question Text</Label>
                        <Input id="question-text" value={editedQuestion.text} onChange={(e) => setEditedQuestion({ ...editedQuestion, text: e.target.value })} />
                    </div>
                    <div className="space-y-4">
                        <Label>Options</Label>
                        {editedQuestion.options.map((option, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 items-center border p-2 rounded-md">
                                <div className="col-span-1 font-bold text-center">{option.label}</div>
                                <div className="col-span-8">
                                    <Input value={option.text} onChange={(e) => {
                                        const newOptions = [...editedQuestion.options];
                                        newOptions[index] = { ...option, text: e.target.value };
                                        setEditedQuestion({ ...editedQuestion, options: newOptions });
                                    }} />
                                </div>
                                <div className="col-span-3">
                                    <Select value={option.dcas_type} onValueChange={(val) => {
                                        const newOptions = [...editedQuestion.options];
                                        newOptions[index] = { ...option, dcas_type: val as any };
                                        setEditedQuestion({ ...editedQuestion, options: newOptions });
                                    }}>
                                        <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="D">{getDCASTypeName("D")}</SelectItem>
                                            <SelectItem value="C">{getDCASTypeName("C")}</SelectItem>
                                            <SelectItem value="A">{getDCASTypeName("A")}</SelectItem>
                                            <SelectItem value="S">{getDCASTypeName("S")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                        <div><Label htmlFor="edit-isActive" className="text-sm font-medium">Active Status</Label><p className="text-xs text-muted-foreground">Inactive questions won&apos;t be used in random assessments.</p></div>
                        <Switch id="edit-isActive" checked={editedQuestion.active !== false} onCheckedChange={(val) => setEditedQuestion({ ...editedQuestion, active: val })} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
