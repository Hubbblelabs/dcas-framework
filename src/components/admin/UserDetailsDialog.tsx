import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useDCASConfig } from "@/hooks/useDCASConfig";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Clock,
  CheckCircle,
} from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  batch?: string;
  institution?: string;
  createdAt?: string;
  latestReportId?: string;
  latestSessionId?: string;
  score?: { primary: string; secondary?: string } | null;
  completedAt?: string | null;
  status: "Completed" | "Not Attempted";
  followup_status?: "none" | "needs_followup" | "in_progress" | "completed";
  last_followup_at?: string | null;
}

interface UserDetailsDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailsDialog({
  user,
  open,
  onOpenChange,
}: UserDetailsDialogProps) {
  const { getDCASTypeName, dcasColors: configColors } = useDCASConfig();
  useEffect(() => {
    if (user) {
      // Intentionally left side effects out; clean up unused states
    }
  }, [user]);

  if (!user) return null;

  const primaryName = user.score?.primary
    ? getDCASTypeName(user.score.primary as any)
    : null;
  const secondaryName = user.score?.secondary
    ? getDCASTypeName(user.score.secondary as any)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{user.name}</DialogTitle>
          <DialogDescription>
            User Profile & Assessment Details
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Contact & Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <h4 className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                Contact Information
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="text-muted-foreground h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="text-muted-foreground h-4 w-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                Academic Info
              </h4>
              <div className="space-y-2">
                {user.institution && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="text-muted-foreground h-4 w-4" />
                    <span>{user.institution}</span>
                  </div>
                )}
                {user.batch && (
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="text-muted-foreground h-4 w-4" />
                    <span>{user.batch}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="text-muted-foreground h-4 w-4" />
                  <span>
                    Joined{" "}
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Assessment Details */}
          <div className="space-y-3">
            <h4 className="text-muted-foreground flex items-center gap-2 text-sm font-medium tracking-wider uppercase">
              Assessment Status
              {user.status === "Completed" ? (
                <Badge className="gap-1 border-0 bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 dark:text-emerald-400">
                  <CheckCircle className="h-3 w-3" /> Completed
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="text-muted-foreground gap-1"
                >
                  <Clock className="h-3 w-3" /> Not Attempted
                </Badge>
              )}
            </h4>

            {user.status === "Completed" && user.score && (
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground mb-1 block text-xs uppercase">
                      Primary Profile
                    </span>
                    <Badge
                      className="px-3 py-1 text-sm text-white"
                      style={{
                        backgroundColor:
                          configColors[
                            user.score.primary as keyof typeof configColors
                          ]?.primary,
                      }}
                    >
                      {primaryName}
                    </Badge>
                  </div>
                  {user.score.secondary && (
                    <div>
                      <span className="text-muted-foreground mb-1 block text-xs uppercase">
                        Secondary Profile
                      </span>
                      <Badge variant="outline" className="px-3 py-1 text-sm">
                        {secondaryName}
                      </Badge>
                    </div>
                  )}
                  {user.completedAt && (
                    <div className="mt-2 border-t border-slate-200 pt-2 sm:col-span-2 dark:border-slate-700">
                      <span className="text-muted-foreground text-xs">
                        Completed on:{" "}
                        {new Date(user.completedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            {user.status !== "Completed" && (
              <div className="text-muted-foreground text-sm italic">
                User has not completed the assessment yet.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
