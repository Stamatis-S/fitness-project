
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ExercisePair } from "./types";
import type { ExerciseCategory } from "@/lib/constants";

interface PowerSetSelectorProps {
  value: string;
  onValueChange: (value: string, pair?: ExercisePair) => void;
}

export function PowerSetSelector({ value, onValueChange }: PowerSetSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();
  
  // Predefined power sets
  const powerSets: Array<{
    id: string;
    name: string;
    exercises: ExercisePair;
  }> = [
    {
      id: "power-set-1",
      name: "PEC FLY - ΣΦΥΡΙΑ",
      exercises: {
        exercise1: { 
          name: "PEC FLY", 
          category: "ΣΤΗΘΟΣ" 
        },
        exercise2: { 
          name: "ΣΦΥΡΙΑ", 
          category: "ΔΙΚΕΦΑΛΑ" 
        }
      }
    },
    {
      id: "power-set-2",
      name: "ΠΙΕΣΕΙΣ ΜΕ ΑΛΤΗΡΕΣ ΣΕ ΕΠΙΚΛΙΝΗ - ΑΛΤΗΡΕΣ ΣΕ ΕΠΙΚΛΙΝΗ",
      exercises: {
        exercise1: { 
          name: "ΠΙΕΣΕΙΣ ΜΕ ΑΛΤΗΡΕΣ ΣΕ ΕΠΙΚΛΙΝΗ", 
          category: "ΣΤΗΘΟΣ" 
        },
        exercise2: { 
          name: "ΑΛΤΗΡΕΣ ΣΕ ΕΠΙΚΛΙΝΗ", 
          category: "ΔΙΚΕΦΑΛΑ" 
        }
      }
    },
    {
      id: "power-set-3",
      name: "ΠΙΕΣΕΙΣ ΜΕ ΜΠΑΡΑ - ΕΚΤΑΣΕΙΣ ΠΛΑΓΙΑ",
      exercises: {
        exercise1: { 
          name: "ΠΙΕΣΕΙΣ ΜΕ ΜΠΑΡΑ", 
          category: "ΣΤΗΘΟΣ" 
        },
        exercise2: { 
          name: "ΕΚΤΑΣΕΙΣ ΠΛΑΓΙΑ", 
          category: "ΩΜΟΙ" 
        }
      }
    },
    {
      id: "power-set-4",
      name: "PUSH DOWN ΤΡΟΧΑΛΙΑ - ΕΚΤΑΣΕΙΣ ΨΗΛΑ ΣΕ ΕΠΙΚΛΙΝΗ",
      exercises: {
        exercise1: { 
          name: "PUSH DOWN ΤΡΟΧΑΛΙΑ", 
          category: "ΤΡΙΚΕΦΑΛΑ" 
        },
        exercise2: { 
          name: "ΕΚΤΑΣΕΙΣ ΨΗΛΑ ΣΕ ΕΠΙΚΛΙΝΗ", 
          category: "ΩΜΟΙ" 
        }
      }
    },
    {
      id: "power-set-5",
      name: "ΜΟΝΟΖΥΓΟ - ΓΑΛΛΙΚΕΣ ΜΕ ΑΛΤΗΡΕΣ",
      exercises: {
        exercise1: { 
          name: "ΜΟΝΟΖΥΓΟ", 
          category: "ΠΛΑΤΗ" 
        },
        exercise2: { 
          name: "ΓΑΛΛΙΚΕΣ ΜΕ ΑΛΤΗΡΕΣ", 
          category: "ΤΡΙΚΕΦΑΛΑ" 
        }
      }
    },
    {
      id: "power-set-6",
      name: "ΚΩΠΗΛΑΤΙΚΗ ΤΡΟΧΑΛΙΑ 1 ΧΕΡΙ - ΕΚΤΑΣΕΙΣ ΠΛΑΓΙΕΣ ΣΕ ΠΑΓΚΟ",
      exercises: {
        exercise1: { 
          name: "ΚΩΠΗΛΑΤΙΚΗ ΤΡΟΧΑΛΙΑ 1 ΧΕΡΙ", 
          category: "ΠΛΑΤΗ" 
        },
        exercise2: { 
          name: "ΕΚΤΑΣΕΙΣ ΠΛΑΓΙΕΣ ΣΕ ΠΑΓΚΟ", 
          category: "ΩΜΟΙ" 
        }
      }
    },
    {
      id: "power-set-7",
      name: "SHRUGS ΜΕ ΑΛΤΗΡΕΣ - ΚΩΠΗΛΑΤΙΚΗ ΜΕ ΜΠΑΡΑ",
      exercises: {
        exercise1: { 
          name: "SHRUGS ΜΕ ΑΛΤΗΡΕΣ", 
          category: "ΩΜΟΙ" 
        },
        exercise2: { 
          name: "ΚΩΠΗΛΑΤΙΚΗ ΜΕ ΜΠΑΡΑ", 
          category: "ΠΛΑΤΗ" 
        }
      }
    },
    {
      id: "power-set-8",
      name: "ΑΥΤΟΣΥΓΚΕΝΤΡΩΣΕΙΣ - ΚΩΠΗΛΑΤΙΚΗ ΣΕ ΕΠΙΚΛΙΝΗ ΜΕ ΑΛΤΗΡΕΣ",
      exercises: {
        exercise1: { 
          name: "ΑΥΤΟΣΥΓΚΕΝΤΡΩΣΕΙΣ", 
          category: "ΔΙΚΕΦΑΛΑ" 
        },
        exercise2: { 
          name: "ΚΩΠΗΛΑΤΙΚΗ ΣΕ ΕΠΙΚΛΙΝΗ ΜΕ ΑΛΤΗΡΕΣ", 
          category: "ΠΛΑΤΗ" 
        }
      }
    },
    {
      id: "power-set-9",
      name: "LEG EXTENSION - HACK SQUATS",
      exercises: {
        exercise1: { 
          name: "LEG EXTENSION", 
          category: "ΠΟΔΙΑ" 
        },
        exercise2: { 
          name: "HACK SQUATS", 
          category: "ΠΟΔΙΑ" 
        }
      }
    }
  ];

  // Filter power sets based on search
  const filteredPowerSets = powerSets.filter(set =>
    set.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground",
          isMobile ? "h-3 w-3" : "h-4 w-4"
        )} />
        <Input
          placeholder="Search power sets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            "pl-9 pr-4",
            isMobile ? "h-8 text-xs" : "h-9 text-sm"
          )}
        />
      </div>

      <div className={cn(
        "grid gap-2",
        isMobile ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 gap-2"
      )}>
        {filteredPowerSets.map((powerSet) => (
          <motion.button
            key={powerSet.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onValueChange(powerSet.id, powerSet.exercises)}
            className={cn(
              "w-full px-3 py-2.5 rounded-lg font-medium",
              "transition-all duration-200",
              "text-center break-words hyphens-auto bg-[#333333] dark:bg-slate-800",
              isMobile ? (
                "min-h-[60px] text-xs leading-tight"
              ) : (
                "min-h-[70px] text-sm"
              ),
              value === powerSet.id
                ? "ring-2 ring-primary"
                : "hover:bg-[#444444] dark:hover:bg-slate-700",
              "text-white dark:text-white"
            )}
          >
            <div className="line-clamp-3 break-words hyphens-auto px-1">
              {powerSet.name}
            </div>
          </motion.button>
        ))}
        
        {filteredPowerSets.length === 0 && (
          <div className={cn(
            "col-span-full text-center py-2 text-muted-foreground",
            isMobile && "text-xs"
          )}>
            No power sets found
          </div>
        )}
      </div>
    </div>
  );
}
