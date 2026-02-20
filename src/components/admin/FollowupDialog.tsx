import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageSquare, User } from "lucide-react";

interface User {
  _id: string;
  name: string;
  status: "Completed" | "Not Attempted";
  followup_status?: "none" | "needs_followup" | "in_progress" | "completed";
  last_followup_at?: string | null;
  latestSessionId?: string;
  latestReportId?: string;
}

interface FollowupDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFollowupUpdate: (userId: string, status: string, last_followup_at: string) => void;
}

export function FollowupDialog({
  user,
  open,
  onOpenChange,
  onFollowupUpdate,
}: FollowupDialogProps) {
  const [followupNote, setFollowupNote] = useState("");
  const [followupStatus, setFollowupStatus] = useState<
    "needs_followup" | "in_progress" | "completed"
  >("needs_followup");
  const [savingFollowup, setSavingFollowup] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [followupHistory, setFollowupHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (user && open) {
      const currentStatus = user.followup_status;
      setFollowupStatus(
        (currentStatus && currentStatus !== "none" ? currentStatus : "needs_followup") as any,
      );
      setFollowupNote("");
      // Use latestSessionId if available, otherwise fallback to latestReportId
      setSessionId(user.latestSessionId || user.latestReportId || null);

      if (user._id) {
        fetchFollowupHistory(user._id);
      }
    }
  }, [user, open]);

  const fetchFollowupHistory = async (userId: string) => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/users/${userId}/followups`);
      if (res.ok) {
        const data = await res.json();
        setFollowupHistory(data.followups || []);
      }
    } catch (e) {
      console.error("Failed to fetch follow-up history:", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleAddFollowup = async () => {
    if (!sessionId || !followupNote.trim()) return;
    setSavingFollowup(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_followup",
          note: followupNote,
          status: followupStatus,
        }),
      });
      if (res.ok) {
        setFollowupNote("");
        const newDate = new Date().toISOString();
        if (user?._id) {
          await fetchFollowupHistory(user._id);
          onFollowupUpdate(user._id, followupStatus, newDate);
        }
      } else {
        console.error("Failed to add follow-up");
      }
    } catch (e) {
      console.error("Failed to add follow-up", e);
    } finally {
      setSavingFollowup(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Follow-ups: {user.name}
          </DialogTitle>
          <DialogDescription>
            Manage and view follow-up history for this user.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {user.status !== "Completed" && (
            <div className="text-muted-foreground text-sm italic">
              User has not completed the assessment yet. Follow-ups can only be tracked for completed assessments.
            </div>
          )}

          {user.status === "Completed" && !sessionId && (
            <div className="text-muted-foreground text-sm italic">
              User has completed the assessment, but no session ID was found.
            </div>
          )}

          {user.status === "Completed" && sessionId && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                  Add Follow-up Note
                </h4>
                <Textarea
                  placeholder="Enter your conversation notes or updates..."
                  value={followupNote}
                  onChange={(e) => setFollowupNote(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex items-center justify-between mt-2">
                  <select
                    className="h-9 rounded-md border border-input bg-transparent px-2 text-xs shadow-sm dark:bg-slate-900 dark:text-slate-100"
                    value={followupStatus}
                    onChange={(e) =>
                      setFollowupStatus(e.target.value as any)
                    }
                  >
                    <option value="needs_followup" className="dark:bg-slate-900">Needs follow-up</option>
                    <option value="in_progress" className="dark:bg-slate-900">In progress</option>
                    <option value="completed" className="dark:bg-slate-900">Completed</option>
                  </select>
                  <Button
                    size="sm"
                    disabled={!followupNote.trim() || savingFollowup}
                    onClick={handleAddFollowup}
                  >
                    {savingFollowup ? "Saving..." : "Save follow-up"}
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-muted-foreground flex items-center gap-2 text-sm font-medium tracking-wider uppercase">
                  <MessageSquare className="h-4 w-4" />
                  History
                </h4>
                {loadingHistory ? (
                  <div className="text-muted-foreground py-4 text-center text-sm">
                    Loading history...
                  </div>
                ) : followupHistory.length === 0 ? (
                  <div className="text-muted-foreground rounded-lg border border-dashed p-4 text-center text-sm">
                    No follow-up history yet.
                  </div>
                ) : (
                  <div className="max-h-[40vh] overflow-y-auto pr-2">
                    <div className="space-y-3">
                      {followupHistory.map((followup: any, index: number) => (
                        <div
                          key={index}
                          className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  followup.status === "completed"
                                    ? "default"
                                    : followup.status === "in_progress"
                                      ? "secondary"
                                      : "outline"
                                }
                                className="text-xs"
                              >
                                {followup.status === "needs_followup"
                                  ? "Needs Follow-up"
                                  : followup.status === "in_progress"
                                    ? "In Progress"
                                    : "Completed"}
                              </Badge>
                              {followup.created_by?.name && (
                                <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                                  <User className="h-3 w-3" />
                                  <span>{followup.created_by.name}</span>
                                </div>
                              )}
                            </div>
                            <span className="text-muted-foreground text-xs">
                              {new Date(followup.date).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            {followup.note}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
