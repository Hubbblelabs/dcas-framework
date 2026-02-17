import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  batch?: string;
  institution?: string;
  createdAt?: string;
  [key: string]: any;
}

interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (user: User) => void;
}

export function EditUserDialog({
  user,
  open,
  onOpenChange,
  onSave,
}: EditUserDialogProps) {
  const [editedUser, setEditedUser] = useState<User | null>(user);

  if (user && editedUser?._id !== user._id) {
    setEditedUser(user);
  }

  const handleSave = () => {
    if (editedUser) {
      onSave(editedUser);
      onOpenChange(false);
    }
  };

  if (!editedUser) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user details.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={editedUser.name}
              onChange={(e) =>
                setEditedUser({ ...editedUser, name: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={editedUser.email}
              onChange={(e) =>
                setEditedUser({ ...editedUser, email: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={editedUser.phone || ""}
              onChange={(e) =>
                setEditedUser({ ...editedUser, phone: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="institution">Institution</Label>
            <Input
              id="institution"
              value={editedUser.institution || ""}
              onChange={(e) =>
                setEditedUser({ ...editedUser, institution: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="batch">Cohort / Batch</Label>
            <Input
              id="batch"
              value={editedUser.batch || ""}
              onChange={(e) =>
                setEditedUser({ ...editedUser, batch: e.target.value })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
