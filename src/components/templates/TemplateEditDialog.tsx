import { useState, useEffect } from "react";
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
import type { WorkoutTemplate } from "@/hooks/useWorkoutTemplates";

interface TemplateEditDialogProps {
  template: WorkoutTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, name: string, description: string) => void;
}

export function TemplateEditDialog({
  template,
  open,
  onOpenChange,
  onSave,
}: TemplateEditDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description || "");
    }
  }, [template]);

  const handleSave = () => {
    if (!template || !name.trim()) return;
    onSave(template.id, name.trim(), description.trim());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Επεξεργασία Template</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Όνομα</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="π.χ. Push Day, Leg Day..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-description">Περιγραφή (προαιρετικό)</Label>
            <Textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Περιέγραψε την προπόνηση..."
              rows={3}
            />
          </div>

          {template && (
            <div className="text-sm text-muted-foreground">
              {template.exercises.length} ασκήσεις σε αυτό το template
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Άκυρο
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Αποθήκευση
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
