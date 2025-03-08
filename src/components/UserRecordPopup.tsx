
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLocation } from "react-router-dom";

interface UserRecord {
  user_id: string;
  username: string;
  exercise: string;
  achievement: string;
  date: string;
}

export function UserRecordPopup() {
  const [records, setRecords] = useState<UserRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Reset popup state when navigating back to home page
  useEffect(() => {
    if (location.pathname === "/") {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  useEffect(() => {
    async function fetchLatestRecords() {
      setIsLoading(true);
      try {
        // Fetch user records from Supabase
        const { data: workoutLogs, error } = await supabase
          .from('workout_logs')
          .select(`
            id,
            user_id,
            exercise_id,
            custom_exercise,
            weight_kg,
            reps,
            workout_date,
            exercises(name),
            profiles(username)
          `)
          .order('weight_kg', { ascending: false })
          .limit(10);

        if (error) throw error;

        // Format the records
        if (workoutLogs && workoutLogs.length > 0) {
          const formattedRecords = workoutLogs.map(log => {
            const exerciseName = log.custom_exercise || log.exercises?.name || 'Unknown Exercise';
            return {
              user_id: log.user_id,
              username: log.profiles?.username || 'Anonymous User',
              exercise: exerciseName,
              achievement: `${log.weight_kg}kg x ${log.reps} reps`,
              date: new Date(log.workout_date).toLocaleDateString()
            };
          });

          // Filter out duplicate user records to show one per user
          const uniqueUserRecords = formattedRecords.filter((record, index, self) =>
            index === self.findIndex((r) => r.user_id === record.user_id)
          );

          setRecords(uniqueUserRecords);
        }
      } catch (error) {
        console.error('Error fetching records:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLatestRecords();

    // Set automatic cycling
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => 
        records.length > 0 ? (prevIndex + 1) % records.length : 0
      );
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [records.length]);

  const currentRecord = records[currentIndex];

  return (
    <div className="flex justify-center">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button className="opacity-0 w-0 h-0 overflow-hidden">
            <span>Records</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 bg-[#1A1F2C] border-gray-700 text-white p-1.5">
          <AnimatePresence mode="wait">
            {currentRecord && (
              <motion.div
                key={currentRecord.user_id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
                className="space-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Trophy className="h-3 w-3 text-amber-500 flex-shrink-0" />
                    <span className="font-semibold text-xs truncate">
                      {currentRecord.username}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{currentRecord.date}</span>
                </div>
                <div className="ml-4.5 text-xs">
                  <span className="text-emerald-400">{currentRecord.exercise}</span>
                  <span className="text-xs text-gray-300 ml-1.5">
                    {currentRecord.achievement}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-0.5 pt-0.5 border-t border-gray-700">
                  <span className="text-xs text-gray-400">
                    {currentIndex + 1} of {records.length}
                  </span>
                  <div className="flex gap-0.5">
                    {records.map((_, idx) => (
                      <TooltipProvider key={idx}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className={`h-1 w-1 rounded-full ${
                                idx === currentIndex ? "bg-purple-500" : "bg-gray-600"
                              }`}
                              onClick={() => setCurrentIndex(idx)}
                            />
                          </TooltipTrigger>
                          <TooltipContent className="py-0.5 px-1.5 text-xs">
                            {records[idx].username}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </PopoverContent>
      </Popover>
    </div>
  );
}
