import { Card } from "@/components/ui/card";
import type { WorkoutLog } from "@/components/saved-exercises/types";
import { Activity, Award } from "lucide-react";
import { motion } from "framer-motion";
import { WorkoutCycleCard } from "./WorkoutCycleCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface WorkoutInsightsProps {
  logs: WorkoutLog[];
}

export function WorkoutInsights({ logs }: WorkoutInsightsProps) {
  const isMobile = useIsMobile();
  
  const getMostTrainedCategory = () => {
    const categoryCounts = logs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const entries = Object.entries(categoryCounts);
    if (entries.length === 0) return null;

    return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0] as WorkoutLog['category'];
  };

  const mostTrainedCategory = getMostTrainedCategory();
  const workoutDates = [...new Set(logs.map(log => log.workout_date))];
  const lastWorkoutDate = workoutDates.length > 0 ? workoutDates[0] : null;
  const uniqueWorkouts = new Set(logs.map(log => log.workout_date)).size;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="col-span-full md:col-span-2"
      >
        <WorkoutCycleCard 
          lastWorkoutDate={lastWorkoutDate} 
          workoutDates={workoutDates}
          compact={isMobile}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="col-span-full md:col-span-1"
      >
        <Card className="h-full p-0 overflow-hidden">
          <div className="grid grid-cols-2 h-full divide-x divide-border">
            {mostTrainedCategory && (
              <div className={`flex flex-col gap-1.5 ${isMobile ? 'p-2.5' : 'p-4'}`}>
                <div className="flex items-center gap-2">
                  <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-green-500/10 flex items-center justify-center`}>
                    <Activity className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-green-500`} />
                  </div>
                </div>
                <div>
                  <p className={`text-muted-foreground ${isMobile ? 'text-[10px]' : 'text-xs'}`}>Most Trained</p>
                  <p className={`font-semibold text-foreground truncate ${isMobile ? 'text-sm' : 'text-lg'}`}>
                    {mostTrainedCategory}
                  </p>
                </div>
              </div>
            )}

            {uniqueWorkouts > 0 && (
              <div className={`flex flex-col gap-1.5 ${isMobile ? 'p-2.5' : 'p-4'}`}>
                <div className="flex items-center gap-2">
                  <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-yellow-500/10 flex items-center justify-center`}>
                    <Award className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-yellow-500`} />
                  </div>
                </div>
                <div>
                  <p className={`text-muted-foreground ${isMobile ? 'text-[10px]' : 'text-xs'}`}>Total Workouts</p>
                  <p className={`font-bold text-foreground ${isMobile ? 'text-lg' : 'text-2xl'}`}>{uniqueWorkouts}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </>
  );
}
