"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

interface Question {
    _id: string;
    text: string;
    options: Array<{ label: string; text: string; dcas_type: "D" | "C" | "A" | "S" }>;
    active: boolean;
}

interface Template {
    _id: string;
    name: string;
    questions?: Question[];
    settings: { language?: string; time_limit?: number; timeLimit?: number; randomized?: boolean; [key: string]: any };
    selection_method?: "manual" | "random";
    question_count?: number;
    isLive?: boolean;
    updatedAt?: string;
}

interface EditAssessmentDialogProps {
    assessment: Template | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdated: () => void;
}

export function EditAssessmentDialog({ assessment, open, onOpenChange, onUpdated }: EditAssessmentDialogProps) {
    const [name, setName] = useState("");
    const [language, setLanguage] = useState("en");
    const [isLive, setIsLive] = useState(false);
    const [selectionMethod, setSelectionMethod] = useState<"manual" | "random">("manual");
    const [timeLimit, setTimeLimit] = useState(0);
    const [questionCount, setQuestionCount] = useState(30);
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open && assessment) {
            setLoading(true);
            fetch("/api/questions").then(r => r.json()).then(d => { setAllQuestions(d); setLoading(false); }).catch(() => setLoading(false));
            setName(assessment.name);
            setLanguage(assessment.settings?.language || "en");
            setTimeLimit(assessment.settings?.time_limit || 0);
            setIsLive(assessment.isLive || false);
            setSelectionMethod(assessment.selection_method || "manual");
            setQuestionCount(assessment.question_count || 30);
            const qIds = (assessment.questions || []).map((q: any) => typeof q === "string" ? q : q._id);
            setSelectedQuestions(qIds);
        }
    }, [open, assessment]);

    const handleToggleQuestion = (id: string) => setSelectedQuestions(prev => prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]);
    const handleSelectAll = () => selectedQuestions.length === allQuestions.filter(q => q.active).length ? setSelectedQuestions([]) : setSelectedQuestions(allQuestions.filter(q => q.active).map(q => q._id));

    const handleSave = async () => {
        if (!assessment || !name.trim()) return;
        setSaving(true);
        try {
            const res = await fetch("/api/assessments", {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ _id: assessment._id, name, questions: selectionMethod === "manual" ? selectedQuestions : [], selection_method: selectionMethod, question_count: questionCount, settings: { ...assessment.settings, language, time_limit: timeLimit }, isLive }),
            });
            if (res.ok) { onUpdated(); onOpenChange(false); }
        } catch (e) { console.error("Failed to update assessment", e); }
        finally { setSaving(false); }
    };

    if (!assessment) return null;
    const activeQuestions = allQuestions.filter(q => q.active);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="sm:max-w-2xl w-full flex flex-col h-full overflow-hidden p-0 gap-0">
                <SheetHeader className="p-6 border-b bg-muted/10">
                    <SheetTitle>Edit Assessment</SheetTitle>
                    <SheetDescription>Update assessment settings and select questions.</SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid gap-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2"><Label htmlFor="edit-name">Template Name *</Label><Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} /></div>
                            <div className="grid gap-2"><Label>Language</Label><Select value={language} onValueChange={setLanguage}><SelectTrigger><SelectValue placeholder="Select Language" /></SelectTrigger><SelectContent><SelectItem value="en">English (en)</SelectItem><SelectItem value="es">Spanish (es)</SelectItem><SelectItem value="fr">French (fr)</SelectItem></SelectContent></Select></div>
                        </div>
                        <div className="grid gap-2"><Label htmlFor="edit-timeLimit">Time Limit (Minutes)</Label><Input id="edit-timeLimit" type="number" min={0} placeholder="0 for unlimited" value={timeLimit} onChange={(e) => setTimeLimit(parseInt(e.target.value) || 0)} /><p className="text-xs text-muted-foreground">Set to 0 for no time limit.</p></div>
                    </div>

                    <div className="space-y-3 p-4 border rounded-lg bg-card">
                        <Label>Question Selection Method</Label>
                        <RadioGroup value={selectionMethod} onValueChange={(val) => setSelectionMethod(val as "manual" | "random")} className="flex flex-col space-y-2 mt-2">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="manual" id="edit-manual" /><Label htmlFor="edit-manual">Manually Select Questions</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="random" id="edit-random" /><Label htmlFor="edit-random">Randomly Generate from Question Bank</Label></div>
                        </RadioGroup>
                    </div>

                    {selectionMethod === "random" && (
                        <div className="grid gap-2 p-4 border rounded-lg bg-muted/20">
                            <Label htmlFor="edit-questionCount">Number of Questions to Generate</Label>
                            <Input id="edit-questionCount" type="number" min={1} max={activeQuestions.length || 100} value={questionCount} onChange={(e) => setQuestionCount(parseInt(e.target.value) || 30)} />
                            <p className="text-xs text-muted-foreground">{activeQuestions.length} total active questions available in bank. Saving will regenerate the random selection.</p>
                        </div>
                    )}

                    <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                        <div><Label htmlFor="edit-isLive" className="text-sm font-medium">Set as Live Assessment</Label><p className="text-xs text-muted-foreground">Only the live assessment is accessible to students</p></div>
                        <Switch id="edit-isLive" checked={isLive} onCheckedChange={setIsLive} />
                    </div>

                    {selectionMethod === "manual" && (
                        <div className="flex-1 overflow-hidden flex flex-col min-h-[300px]">
                            <div className="flex items-center justify-between mb-2">
                                <Label>Select Questions</Label>
                                <Button variant="ghost" size="sm" onClick={handleSelectAll}>{selectedQuestions.length === activeQuestions.length ? "Deselect All" : "Select All"}</Button>
                            </div>
                            <ScrollArea className="flex-1 border rounded-lg p-3 h-[300px]">
                                {loading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div> : activeQuestions.length === 0 ? <p className="text-center py-8 text-muted-foreground">No active questions available.</p> : (
                                    <div className="space-y-2">
                                        {activeQuestions.map((q, i) => (
                                            <div key={q._id} className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${selectedQuestions.includes(q._id) ? "bg-primary/5 border-primary/30" : "hover:bg-muted/50"}`} onClick={() => handleToggleQuestion(q._id)}>
                                                <Checkbox checked={selectedQuestions.includes(q._id)} onCheckedChange={() => handleToggleQuestion(q._id)} />
                                                <div className="flex-1 min-w-0"><p className="text-sm font-medium">{i + 1}. {q.text}</p><p className="text-xs text-muted-foreground mt-1">{q.options.length} options • {q.options.map(o => o.dcas_type).join(", ")}</p></div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                            <p className="text-xs text-muted-foreground mt-2">{selectedQuestions.length} of {activeQuestions.length} questions selected</p>
                        </div>
                    )}
                </div>
                <SheetFooter className="p-6 border-t bg-muted/10">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={!name.trim() || saving || (selectionMethod === "manual" && selectedQuestions.length === 0) || (selectionMethod === "random" && questionCount <= 0)}>{saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
