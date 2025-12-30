import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Edit2, Trash2, MoreVertical, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import type { WorkoutTemplate, TemplateExercise } from "@/hooks/useWorkoutTemplates";
import { EXERCISE_CATEGORIES } from "@/lib/constants";
import { format } from "date-fns";
import { el } from "date-fns/locale";

interface TemplateListProps {
  templates: WorkoutTemplate[];
  onLoad: (template: WorkoutTemplate) => void;
  onEdit: (template: WorkoutTemplate) => void;
  onDelete: (id: string) => void;
}

export function TemplateList({ templates, onLoad, onEdit, onDelete }: TemplateListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getCategoryColor = (category: string) => {
    return EXERCISE_CATEGORIES[category as keyof typeof EXERCISE_CATEGORIES]?.color || "#888";
  };

  const getUniqueCategories = (exercises: TemplateExercise[]) => {
    const categories = [...new Set(exercises.map((e) => e.category))];
    return categories.slice(0, 3);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  if (templates.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Δεν έχεις αποθηκευμένα templates.</p>
        <p className="text-sm mt-1">Αποθήκευσε μια προπόνηση για να ξεκινήσεις!</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <AnimatePresence>
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-4 hover:bg-accent/5 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {template.name}
                    </h3>
                    
                    {template.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {template.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {getUniqueCategories(template.exercises).map((category) => (
                        <Badge
                          key={category}
                          variant="outline"
                          className="text-xs"
                          style={{ borderColor: getCategoryColor(category), color: getCategoryColor(category) }}
                        >
                          {category}
                        </Badge>
                      ))}
                      <span className="text-xs text-muted-foreground">
                        {template.exercises.length} ασκήσεις
                      </span>
                    </div>

                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(template.updated_at), "d MMM yyyy", { locale: el })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => onLoad(template)}
                      className="gap-1"
                    >
                      <Play className="h-4 w-4" />
                      Φόρτωση
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(template)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Επεξεργασία
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(template.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Διαγραφή
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Διαγραφή Template</AlertDialogTitle>
            <AlertDialogDescription>
              Είσαι σίγουρος ότι θέλεις να διαγράψεις αυτό το template; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Άκυρο</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
              Διαγραφή
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
