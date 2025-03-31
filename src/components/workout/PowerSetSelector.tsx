
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
          id: "pec-fly", 
          name: "PEC FLY", 
          category: "ΣΤΗΘΟΣ" 
        },
        exercise2: { 
          id: "sfyria", 
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
          id: "pieseis-altires-epiklini", 
          name: "ΠΙΕΣΕΙΣ ΜΕ ΑΛΤΗΡΕΣ ΣΕ ΕΠΙΚΛΙΝΗ", 
          category: "ΣΤΗΘΟΣ" 
        },
        exercise2: { 
          id: "altires-epiklini", 
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
          id: "pieseis-mpara", 
          name: "ΠΙΕΣΕΙΣ ΜΕ ΜΠΑΡΑ", 
          category: "ΣΤΗΘΟΣ" 
        },
        exercise2: { 
          id: "ektaseis-plagia", 
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
          id: "push-down-troxalia", 
          name: "PUSH DOWN ΤΡΟΧΑΛΙΑ", 
          category: "ΤΡΙΚΕΦΑΛΑ" 
        },
        exercise2: { 
          id: "ektaseis-psila-epiklini", 
          name: "ΕΚΤΑΣΕΙΣ ΨΗΛΑ ΣΕ ΕΠΙΚΛΙΝΗ", 
          category: "ΩΜΟΙ" 
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
        "grid gap-1.5",
        isMobile ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3 gap-1.5"
      )}>
        {filteredPowerSets.map((powerSet) => (
          <motion.button
            key={powerSet.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onValueChange(powerSet.id, powerSet.exercises)}
            className={cn(
              "w-full px-2 py-1.5 rounded-lg font-medium",
              "transition-all duration-200",
              "text-center break-words hyphens-auto bg-[#333333] dark:bg-slate-800",
              isMobile ? (
                "min-h-[40px] text-[10px] leading-tight"
              ) : (
                "min-h-[46px] text-xs"
              ),
              value === powerSet.id
                ? "ring-2 ring-primary"
                : "hover:bg-[#444444] dark:hover:bg-slate-700",
              "text-white dark:text-white"
            )}
          >
            <div className="line-clamp-2 break-words hyphens-auto px-0.5">
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
