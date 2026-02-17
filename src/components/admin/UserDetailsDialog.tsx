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
  score?: { primary: string; secondary?: string } | null;
  completedAt?: string | null;
  status: "Completed" | "Not Attempted";
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
          <DialogDescription>User Profile & Assessment Details</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Contact & Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Contact Information
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Academic Info
              </h4>
              <div className="space-y-2">
                {user.institution && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{user.institution}</span>
                  </div>
                )}
                {user.batch && (
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span>{user.batch}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
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
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              Assessment Status
              {user.status === "Completed" ? (
                <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 dark:text-emerald-400 gap-1 border-0">
                  <CheckCircle className="h-3 w-3" /> Completed
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-muted-foreground gap-1">
                  <Clock className="h-3 w-3" /> Not Attempted
                </Badge>
              )}
            </h4>

            {user.status === "Completed" && user.score && (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-100 dark:border-slate-800">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase block mb-1">
                      Primary Profile
                    </span>
                    <Badge
                      className="text-white text-sm py-1 px-3"
                      style={{
                        backgroundColor:
                          configColors[user.score.primary as keyof typeof configColors]?.primary,
                      }}
                    >
                      {primaryName}
                    </Badge>
                  </div>
                  {user.score.secondary && (
                    <div>
                      <span className="text-xs text-muted-foreground uppercase block mb-1">
                        Secondary Profile
                      </span>
                      <Badge variant="outline" className="text-sm py-1 px-3">
                        {secondaryName}
                      </Badge>
                    </div>
                  )}
                  {user.completedAt && (
                    <div className="sm:col-span-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-xs text-muted-foreground">
                        Completed on:{" "}
                        {new Date(user.completedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            {user.status !== "Completed" && (
                <div className="text-sm text-muted-foreground italic">
                    User has not completed the assessment yet.
                </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
