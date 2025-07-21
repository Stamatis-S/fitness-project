import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Target, Clock, Zap, Users } from "lucide-react";
import type { WorkoutTemplate } from "./types";

interface AITemplatesProps {
  onTemplateSelect: (template: WorkoutTemplate) => void;
}

const templates: WorkoutTemplate[] = [
  {
    id: "1",
    name: "Push Day Power",
    description: "Εστίαση σε στήθος, ώμους και τρικέφαλα για μέγιστη ανάπτυξη δύναμης",
    difficulty: "intermediate",
    duration: "45-60λ",
    exercises: [], // We'll populate this with actual exercises
    tags: ["Δύναμη", "Όγκος", "Push"],
    aiGenerated: true
  },
  {
    id: "2",
    name: "Full Body HIIT",
    description: "Υψηλής έντασης κυκλικό πρόγραμμα για καύση λίπους και τόνωση",
    difficulty: "advanced",
    duration: "30-40λ",
    exercises: [],
    tags: ["HIIT", "Καύση λίπους", "Καρδιο"],
    aiGenerated: true
  },
  {
    id: "3",
    name: "Beginner's Foundation",
    description: "Ιδανικό πρώτο πρόγραμμα για εξοικείωση με τις βασικές ασκήσεις",
    difficulty: "beginner",
    duration: "25-35λ",
    exercises: [],
    tags: ["Αρχάριος", "Βάσεις", "Ασφάλεια"],
    aiGenerated: true
  },
  {
    id: "4",
    name: "Core & Stability",
    description: "Εστίαση σε κορμό και σταθερότητα για καλύτερη απόδοση",
    difficulty: "intermediate",
    duration: "20-30λ",
    exercises: [],
    tags: ["Κορμός", "Σταθερότητα", "Functional"],
    aiGenerated: true
  },
  {
    id: "5",
    name: "Leg Day Destroyer",
    description: "Έντονο πρόγραμμα για πόδια που θα σε βάλει στα όριά σου",
    difficulty: "advanced",
    duration: "60-75λ",
    exercises: [],
    tags: ["Πόδια", "Δύναμη", "Έντονο"],
    aiGenerated: true
  },
  {
    id: "6",
    name: "Home Bodyweight",
    description: "Αποτελεσματικό πρόγραμμα χωρίς εξοπλισμό για προπόνηση στο σπίτι",
    difficulty: "beginner",
    duration: "30-40λ",
    exercises: [],
    tags: ["Σπίτι", "Bodyweight", "Εύκολο"],
    aiGenerated: true
  }
];

export function AITemplates({ onTemplateSelect }: AITemplatesProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredTemplates = templates.filter(template => {
    const matchesDifficulty = !selectedDifficulty || template.difficulty === selectedDifficulty;
    const matchesTag = !selectedTag || template.tags.includes(selectedTag);
    return matchesDifficulty && matchesTag;
  });

  const allTags = Array.from(new Set(templates.flatMap(t => t.tags)));

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-500';
      case 'intermediate': return 'text-yellow-500';
      case 'advanced': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Αρχάριος';
      case 'intermediate': return 'Μεσαίος';
      case 'advanced': return 'Προχωρημένος';
      default: return difficulty;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">AI Workout Templates</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Έξυπνα προγράμματα προσαρμοσμένα στις ανάγκες σου
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Difficulty Filter */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Επίπεδο:</p>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedDifficulty === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDifficulty(null)}
            >
              Όλα
            </Button>
            {['beginner', 'intermediate', 'advanced'].map((difficulty) => (
              <Button
                key={difficulty}
                variant={selectedDifficulty === difficulty ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDifficulty(difficulty)}
              >
                {getDifficultyText(difficulty)}
              </Button>
            ))}
          </div>
        </div>

        {/* Tag Filter */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Κατηγορία:</p>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedTag === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTag(null)}
            >
              Όλες
            </Button>
            {allTags.map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-all duration-200 group h-full">
                <div className="space-y-4 h-full flex flex-col">
                  {/* Header */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg">{template.name}</h3>
                      {template.aiGenerated && (
                        <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {template.description}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 py-3 bg-muted/30 rounded-lg">
                    <div className="text-center">
                      <Target className={`h-4 w-4 mx-auto mb-1 ${getDifficultyColor(template.difficulty)}`} />
                      <p className="text-xs text-muted-foreground">Επίπεδο</p>
                      <p className={`text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                        {getDifficultyText(template.difficulty)}
                      </p>
                    </div>
                    <div className="text-center">
                      <Clock className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                      <p className="text-xs text-muted-foreground">Διάρκεια</p>
                      <p className="text-xs font-medium">{template.duration}</p>
                    </div>
                    <div className="text-center">
                      <Users className="h-4 w-4 mx-auto mb-1 text-purple-500" />
                      <p className="text-xs text-muted-foreground">Δημοφιλές</p>
                      <p className="text-xs font-medium">★ 4.8</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => onTemplateSelect(template)}
                    className="w-full mt-auto"
                    size="sm"
                  >
                    Χρήση Template
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Δεν βρέθηκαν templates με αυτά τα κριτήρια
          </p>
        </div>
      )}

      {/* Pro Tip */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium">💡 Pro Tip</p>
            <p className="text-xs text-muted-foreground">
              Τα AI templates προσαρμόζονται αυτόματα στο επίπεδό σου και τις προτιμήσεις σου. 
              Μπορείς να τα τροποποιήσεις μετά την επιλογή!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}