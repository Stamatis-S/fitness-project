import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Edit2, Trash2, MoreVertical, Calendar, Dumbbell, ChevronRight } from "lucide-react";
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
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getCategoryColor = (category: string) => {
    return EXERCISE_CATEGORIES[category as keyof typeof EXERCISE_CATEGORIES]?.color || "#888";
  };

  const getUniqueCategories = (exercises: TemplateExercise[]) => {
    const categories = [...new Set(exercises.map((e) => e.category))];
    return categories;
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Dumbbell className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground font-medium">Δεν έχεις templates ακόμα</p>
        <p className="text-sm text-muted-foreground mt-1">
          Δημιούργησε το πρώτο σου template πατώντας "Νέο"
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <AnimatePresence>
          {templates.map((template, index) => {
            const isExpanded = expandedId === template.id;
            const categories = getUniqueCategories(template.exercises);
            const totalSets = template.exercises.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0);

            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden">
                  {/* Main Row - Always Visible */}
                  <div
                    className="p-4 cursor-pointer hover:bg-accent/5 transition-colors"
                    onClick={() => toggleExpand(template.id)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Category Color Indicator */}
                      <div className="flex flex-col gap-0.5 pt-1">
                        {categories.slice(0, 3).map((cat, i) => (
                          <div
                            key={cat}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: getCategoryColor(cat) }}
                          />
                        ))}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground truncate">
                            {template.name}
                          </h3>
                          <ChevronRight
                            className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${
                              isExpanded ? "rotate-90" : ""
                            }`}
                          />
                        </div>
                        
                        {template.description && (
                          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                            {template.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Dumbbell className="h-3 w-3" />
                            {template.exercises.length} ασκήσεις
                          </span>
                          <span>•</span>
                          <span>{totalSets} σετ</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(template.updated_at), "d MMM", { locale: el })}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          onClick={() => onLoad(template)}
                          className="gap-1.5 h-8"
                        >
                          <Play className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Φόρτωση</span>
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
                  </div>

                  {/* Expanded Content - Exercise Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-0">
                          <div className="border-t pt-3">
                            <div className="grid gap-2">
                              {template.exercises.map((exercise, exIndex) => (
                                <div
                                  key={exIndex}
                                  className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg"
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: getCategoryColor(exercise.category) }}
                                    />
                                    <span className="text-sm font-medium">{exercise.name}</span>
                                  </div>
                                  <Badge variant="secondary" className="text-xs">
                                    {exercise.sets?.length || 0} σετ
                                  </Badge>
                                </div>
                              ))}
                            </div>

                            {/* Category Badges */}
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {categories.map((category) => (
                                <Badge
                                  key={category}
                                  variant="outline"
                                  className="text-xs"
                                  style={{ 
                                    borderColor: getCategoryColor(category), 
                                    color: getCategoryColor(category),
                                    backgroundColor: `${getCategoryColor(category)}10`
                                  }}
                                >
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
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
