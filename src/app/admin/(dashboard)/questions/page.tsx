"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { EditQuestionDialog } from "@/components/admin/EditQuestionDialog";
import { AddQuestionDialog } from "@/components/admin/AddQuestionDialog";
import { useDCASConfig } from "@/hooks/useDCASConfig";

interface Question {
  _id: string;
  text: string;
  options: Array<{
    label: string;
    text: string;
    dcas_type: "D" | "C" | "A" | "S";
  }>;
  active: boolean;
  [key: string]: any;
}

export default function QuestionsPage() {
  const { getDCASTypeSymbol } = useDCASConfig();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteQuestion, setDeleteQuestion] = useState<Question | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState<{
    question: Question;
    message: string;
    affectedTemplates: Array<{
      _id: string;
      name: string;
      isLive: boolean;
      questionCount: number;
    }>;
  } | null>(null);

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setIsEditDialogOpen(true);
  };

  const handleSaveQuestion = async (updatedQuestion: Question) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/questions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedQuestion),
      });
      if (res.ok) {
        const saved = await res.json();
        setQuestions(questions.map((q) => (q._id === saved._id ? saved : q)));
        setIsEditDialogOpen(false);
        setEditingQuestion(null);
      } else {
        const err = await res.json();
        alert(`Failed: ${err.error || "Unknown error"}`);
      }
    } catch {
      alert("An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddQuestion = (newQuestion: Question) => {
    setQuestions([newQuestion, ...questions]);
  };

  const handleConfirmDelete = async () => {
    if (!deleteQuestion) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/questions?id=${deleteQuestion._id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.warning) {
        // Show warning about affected templates
        setDeleteWarning({
          question: deleteQuestion,
          message: data.message,
          affectedTemplates: data.affectedTemplates,
        });
        setDeleteQuestion(null);
      } else if (res.ok) {
        setQuestions(questions.filter((q) => q._id !== deleteQuestion._id));
        setDeleteQuestion(null);
      }
    } catch (e) {
      console.error("Delete failed", e);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleForceDelete = async () => {
    if (!deleteWarning) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/questions?id=${deleteWarning.question._id}&force=true`,
        {
          method: "DELETE",
        },
      );
      if (res.ok) {
        setQuestions(
          questions.filter((q) => q._id !== deleteWarning.question._id),
        );
        setDeleteWarning(null);
      }
    } catch (e) {
      console.error("Force delete failed", e);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetch("/api/questions")
      .then((r) => r.json())
      .then((d) => {
        setQuestions(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Question Bank</h1>
          <p className="text-muted-foreground">
            Manage assessment questions and DCAS mapping
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Question
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Questions</CardTitle>
          <CardDescription>
            Manage the pool of questions available for assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="border-border/40 overflow-hidden rounded-md border">
              <div className="overflow-x-auto">
                <Table className="min-w-200">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30%]">Question Text</TableHead>
                      <TableHead className="w-[40%]">Options (Map)</TableHead>
                      <TableHead className="w-[15%]">Status</TableHead>
                      <TableHead className="w-[15%] text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.map((q) => (
                      <TableRow key={q._id}>
                        <TableCell className="align-top font-medium">
                          {q.text}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {q.options.map((opt) => (
                              <Badge
                                key={opt.label}
                                variant="outline"
                                className="text-xs whitespace-nowrap"
                              >
                                {opt.label}: {getDCASTypeSymbol(opt.dcas_type)}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="align-top">
                          <Badge
                            className={
                              q.active ? "bg-green-500" : "bg-gray-500"
                            }
                          >
                            {q.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right align-top">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(q)}
                            >
                              <Pencil className="mr-2 h-4 w-4 text-green-600" />
                              <span className="hidden text-green-600 sm:inline">
                                Edit
                              </span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteQuestion(q)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {questions.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-muted-foreground py-8 text-center"
                        >
                          No questions found. Add one to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <AddQuestionDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddQuestion}
      />
      <EditQuestionDialog
        question={editingQuestion}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveQuestion}
      />
      <AlertDialog
        open={!!deleteQuestion}
        onOpenChange={(open) => !open && setDeleteQuestion(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This cannot be undone.
              {deleteQuestion && (
                <span className="text-foreground mt-2 block font-medium">
                  &quot;{deleteQuestion.text}&quot;
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Warning dialog for questions used in assessments */}
      <AlertDialog
        open={!!deleteWarning}
        onOpenChange={(open) => !open && setDeleteWarning(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Question In Use
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>{deleteWarning?.message}</p>
                <p className="text-foreground font-medium">
                  &quot;{deleteWarning?.question.text}&quot;
                </p>
                <div className="space-y-2 rounded-lg border p-3">
                  <p className="text-foreground text-xs font-semibold">
                    Affected Assessment Templates:
                  </p>
                  {deleteWarning?.affectedTemplates.map((t) => (
                    <div
                      key={t._id}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="font-medium">{t.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {t.questionCount} questions
                        </span>
                        {t.isLive && (
                          <Badge className="bg-green-500 px-1.5 py-0 text-xs">
                            Live
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Deleting this question will remove it from all affected
                  templates and update their question counts.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleForceDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Anyway"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
