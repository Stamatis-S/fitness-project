import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { TemplateExercise } from "@/hooks/useWorkoutTemplates";

interface SaveTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, description: string, exercises: TemplateExercise[]) => void;
  exercises: TemplateExercise[];
}

export function SaveTemplateDialog({
  open,
  onOpenChange,
  onSave,
  exercises,
}: SaveTemplateDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), description.trim(), exercises);
    setName("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Αποθήκευση ως Template</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="save-template-name">Όνομα Template</Label>
            <Input
              id="save-template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="π.χ. Push Day, Leg Day..."
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="save-template-description">Περιγραφή (προαιρετικό)</Label>
            <Textarea
              id="save-template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Περιέγραψε την προπόνηση..."
              rows={3}
            />
          </div>

          <div className="text-sm text-muted-foreground">
            Θα αποθηκευτούν {exercises.length} ασκήσεις
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Άκυρο
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || exercises.length === 0}>
            Αποθήκευση
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
