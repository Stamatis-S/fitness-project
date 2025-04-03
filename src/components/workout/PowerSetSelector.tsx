
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ExercisePair } from "./types";
import type { ExerciseCategory } from "@/lib/constants";

interface PowerSetSelectorProps {
  value: string;
  onValueChange: (value: string, pair?: ExercisePair) => void;
}

interface PowerSetData {
  id: number;
  name: string;
  exercise1_name: string;
  exercise1_category: string;
  exercise2_name: string;
  exercise2_category: string;
}

export function PowerSetSelector({ value, onValueChange }: PowerSetSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [powerSets, setPowerSets] = useState<Array<{
    id: string;
    name: string;
    exercises: ExercisePair;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const fetchPowerSets = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('power_sets')
          .select('*')
          .order('id', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Convert from database format to our application format
          const formattedPowerSets = data.map((set: PowerSetData) => ({
            id: `power-set-${set.id}`,
            name: set.name,
            exercises: {
              exercise1: {
                name: set.exercise1_name,
                category: set.exercise1_category as ExerciseCategory
              },
              exercise2: {
                name: set.exercise2_name,
                category: set.exercise2_category as ExerciseCategory
              }
            }
          }));
          
          setPowerSets(formattedPowerSets);
        }
      } catch (error) {
        console.error('Error fetching power sets:', error);
        toast.error('Failed to load power sets');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPowerSets();
  }, []);

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
        {isLoading ? (
          <div className={cn(
            "col-span-full text-center py-4 text-muted-foreground",
            isMobile && "text-xs"
          )}>
            Loading power sets...
          </div>
        ) : (
          <>
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
            
            {filteredPowerSets.length === 0 && !isLoading && (
              <div className={cn(
                "col-span-full text-center py-2 text-muted-foreground",
                isMobile && "text-xs"
              )}>
                No power sets found
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
