"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useDCASConfig } from "@/hooks/useDCASConfig";

interface OptionData {
    label: string;
    text: string;
    dcas_type: "D" | "C" | "A" | "S";
}

interface AddQuestionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (question: any) => void;
}

export function AddQuestionDialog({ open, onOpenChange, onSave }: AddQuestionDialogProps) {
    const [questionText, setQuestionText] = useState("");
    const [options, setOptions] = useState<OptionData[]>([
        { label: "A", text: "", dcas_type: "D" },
        { label: "B", text: "", dcas_type: "C" },
        { label: "C", text: "", dcas_type: "A" },
        { label: "D", text: "", dcas_type: "S" },
    ]);
    const [isActive, setIsActive] = useState(true);
    const [saving, setSaving] = useState(false);
    const { getDCASTypeName } = useDCASConfig();

    const handleOptionChange = (index: number, field: keyof OptionData, value: string) => {
        const newOptions = [...options];
        newOptions[index] = { ...newOptions[index], [field]: value };
        setOptions(newOptions);
    };

    const handleSave = async () => {
        if (!questionText.trim() || options.some(o => !o.text.trim())) return;
        setSaving(true);
        try {
            const response = await fetch("/api/questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: questionText, options, active: isActive }),
            });
            if (response.ok) {
                const newQuestion = await response.json();
                onSave(newQuestion);
                setQuestionText("");
                setOptions([
                    { label: "A", text: "", dcas_type: "D" },
                    { label: "B", text: "", dcas_type: "C" },
                    { label: "C", text: "", dcas_type: "A" },
                    { label: "D", text: "", dcas_type: "S" },
                ]);
                setIsActive(true);
                onOpenChange(false);
            }
        } catch (error) { console.error("Failed to create question", error); }
        finally { setSaving(false); }
    };

    const isValid = questionText.trim() && options.every(o => o.text.trim());

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add New Question</DialogTitle>
                    <DialogDescription>Create a new DCAS assessment question with 4 answer options.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="questionText">Question Text *</Label>
                        <Input id="questionText" placeholder="Enter the question..." value={questionText} onChange={(e) => setQuestionText(e.target.value)} />
                    </div>
                    <div className="space-y-3">
                        <Label>Answer Options *</Label>
                        {options.map((option, index) => (
                            <div key={option.label} className="grid grid-cols-[60px_1fr_100px] gap-2 items-center">
                                <div className="flex items-center justify-center h-10 bg-muted rounded-lg font-semibold">{option.label}</div>
                                <Input placeholder={`Option ${option.label} text...`} value={option.text} onChange={(e) => handleOptionChange(index, "text", e.target.value)} />
                                <Select value={option.dcas_type} onValueChange={(val) => handleOptionChange(index, "dcas_type", val)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="D">{getDCASTypeName("D")}</SelectItem>
                                        <SelectItem value="C">{getDCASTypeName("C")}</SelectItem>
                                        <SelectItem value="A">{getDCASTypeName("A")}</SelectItem>
                                        <SelectItem value="S">{getDCASTypeName("S")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        ))}
                        <p className="text-xs text-muted-foreground">Each option should map to a DCAS behavioural type.</p>
                    </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50 mt-4">
                    <div><Label htmlFor="isActive" className="text-sm font-medium">Active Status</Label><p className="text-xs text-muted-foreground">Inactive questions won&apos;t be used in random assessments.</p></div>
                    <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={!isValid || saving}>{saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : "Add Question"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
