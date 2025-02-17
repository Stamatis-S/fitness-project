
import { useState, useEffect } from "react";
import { format, addDays, isAfter, isBefore, differenceInDays } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

interface WorkoutCycleCardProps {
  lastWorkoutDate: string | null;
}

const CYCLE_DAYS = 12;

export function WorkoutCycleCard({ lastWorkoutDate }: WorkoutCycleCardProps) {
  const [cycleStartDate, setCycleStartDate] = useState<Date | null>(null);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (cycleStartDate) {
      const today = new Date();
      const cycleEndDate = addDays(cycleStartDate, CYCLE_DAYS);
      const remaining = CYCLE_DAYS - differenceInDays(today, cycleStartDate);
      
      if (remaining <= 0) {
        setDaysLeft(0);
        setIsComplete(true);
        toast.info("Cycle Completed! Please select a new start date");
      } else {
        setDaysLeft(remaining);
        
        // Check for missed days
        const lastWorkout = lastWorkoutDate ? new Date(lastWorkoutDate) : null;
        if (lastWorkout) {
          const daysSinceLastWorkout = differenceInDays(today, lastWorkout);
          if (daysSinceLastWorkout > 1) {
            const resumeDate = addDays(today, 2);
            toast.warning(
              `Streak paused! Resume before ${format(resumeDate, 'MMM d, yyyy')} to keep progress`
            );
          }
        }
        
        // Payment reminder on last day
        if (remaining === 1) {
          toast.info("Reminder: Payment due tomorrow!");
        }
      }
    }
  }, [cycleStartDate, lastWorkoutDate]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    const today = new Date();
    
    // Prevent future dates
    if (isAfter(date, today)) {
      toast.error("Cannot select a future date");
      return;
    }
    
    // Prevent restarting before cycle completion
    if (cycleStartDate && !isComplete) {
      toast.error("Cannot restart cycle before completion");
      return;
    }
    
    setCycleStartDate(date);
    setIsComplete(false);
    setDaysLeft(CYCLE_DAYS);
  };

  const progress = daysLeft !== null 
    ? ((CYCLE_DAYS - daysLeft) / CYCLE_DAYS) * 100 
    : 0;

  return (
    <Card className="p-4">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold">Workout Cycle</h3>
            {cycleStartDate ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Cycle started on: {format(cycleStartDate, 'MMM d, yyyy')}
                </p>
                {!isComplete && daysLeft !== null && (
                  <p className="text-sm">
                    {daysLeft} days left to complete cycle
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Set your first workout day
              </p>
            )}
          </div>
          
          {(!cycleStartDate || isComplete) && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Set First Day
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={cycleStartDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => isAfter(date, new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
        </div>

        {cycleStartDate && (
          <Progress
            value={progress}
            className="h-2"
          />
        )}
      </div>
    </Card>
  );
}
