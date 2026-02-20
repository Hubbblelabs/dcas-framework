"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Pencil, Eye, Radio, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreateAssessmentDialog } from "@/components/admin/CreateAssessmentDialog";
import { EditAssessmentDialog } from "@/components/admin/EditAssessmentDialog";
import { PreviewAssessmentDialog } from "@/components/admin/PreviewAssessmentDialog";

interface AssessmentTemplate {
  _id: string;
  name: string;
  description: string;

  questions: any[];
  isLive: boolean;
  settings: {
    language?: string;
    timeLimit?: number;
    time_limit?: number;
    shuffleQuestions?: boolean;
    showResults?: boolean;
    randomized?: boolean;
  };
  selection_method?: "manual" | "random";
  question_count?: number;
  createdAt: string;
}

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<AssessmentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] =
    useState<AssessmentTemplate | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [previewAssessment, setPreviewAssessment] =
    useState<AssessmentTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [deleteAssessment, setDeleteAssessment] =
    useState<AssessmentTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchAssessments = useCallback(async () => {
    try {
      const res = await fetch("/api/assessments");
      const data = await res.json();
      setAssessments(data);
    } catch (e: unknown) {
      console.error("Failed to fetch assessments", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  const handleToggleLive = async (assessment: AssessmentTemplate) => {
    try {
      const res = await fetch("/api/assessments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: assessment._id,
          isLive: !assessment.isLive,
        }),
      });
      if (res.ok) fetchAssessments();
    } catch (e) {
      console.error("Toggle failed", e);
    }
  };

  const handleDelete = async () => {
    if (!deleteAssessment) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/assessments/${deleteAssessment._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAssessments(
          assessments.filter((a) => a._id !== deleteAssessment._id),
        );
        setDeleteAssessment(null);
      } else {
        const data = await res.json();
        setDeleteError(data.error || "Failed to delete assessment");
      }
    } catch (e) {
      console.error("Delete failed", e);
      setDeleteError("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreated = (newAssessment: AssessmentTemplate) => {
    if (newAssessment.isLive) {
      // Re-fetch so any previously-live assessment gets its isLive flag cleared in the UI
      fetchAssessments();
    } else {
      setAssessments([newAssessment, ...assessments]);
    }
  };
  const handleUpdated = () => {
    fetchAssessments();
    setIsEditOpen(false);
    setEditingAssessment(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
          <p className="text-muted-foreground">
            Create and manage assessment templates
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Assessment
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assessments.map((a) => (
            <Card
              key={a._id}
              className={`relative ${a.isLive ? "border-green-500/50 shadow-lg shadow-green-500/10" : ""}`}
            >
              {a.isLive && (
                <div className="absolute top-3 right-3">
                  <Badge className="animate-pulse bg-green-500 text-white">
                    <Radio className="mr-1 h-3 w-3" />
                    LIVE
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-lg">{a.name}</CardTitle>
                <CardDescription>
                  {a.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Questions</span>
                    <span className="font-medium">
                      {a.questions?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Time Limit</span>
                    <span className="font-medium">
                      {a.settings?.timeLimit
                        ? `${a.settings.timeLimit} min`
                        : "None"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="border-border/40 flex gap-2 border-t pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setPreviewAssessment(a);
                        setIsPreviewOpen(true);
                      }}
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setEditingAssessment(a);
                        setIsEditOpen(true);
                      }}
                    >
                      <Pencil className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={a.isLive ? "destructive" : "default"}
                      size="sm"
                      className="flex-1"
                      onClick={() => handleToggleLive(a)}
                    >
                      {a.isLive ? "Take Offline" : "Go Live"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteAssessment(a)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {assessments.length === 0 && (
            <div className="text-muted-foreground col-span-full py-12 text-center">
              No assessments yet. Create one to get started.
            </div>
          )}
        </div>
      )}

      <CreateAssessmentDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={handleCreated}
      />
      <EditAssessmentDialog
        assessment={editingAssessment}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onUpdated={handleUpdated}
      />
      <PreviewAssessmentDialog
        assessment={previewAssessment}
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
      />
      <AlertDialog
        open={!!deleteAssessment}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setDeleteAssessment(null);
            setDeleteError(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteAssessment?.name}
              &quot;? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
              {deleteError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
