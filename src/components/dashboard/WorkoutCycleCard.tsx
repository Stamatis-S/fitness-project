import { useState, useEffect } from "react";
import { format, addDays, isAfter, isBefore, differenceInDays } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

interface WorkoutCycleCardProps {
  lastWorkoutDate: string | null;
  workoutDates: string[];
  compact?: boolean;
}

interface WorkoutCycle {
  id: number;
  user_id: string;
  start_date: string;
  completed_days: number;
  is_active: boolean;
  created_at: string;
  completed_at: string | null;
  notifications_enabled: boolean;
  last_notification_sent: string | null;
}

const CYCLE_DAYS = 12;
const STORAGE_KEY = 'workout_cycle_start_date';

export function WorkoutCycleCard({ lastWorkoutDate, workoutDates, compact }: WorkoutCycleCardProps) {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [isComplete, setIsComplete] = useState(false);

  if (!session) {
    navigate('/auth');
    return null;
  }

  // Query current cycle
  const { data: currentCycle, refetch: refetchCycle } = useQuery({
    queryKey: ['workout_cycle'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_cycles')
        .select('*')
        .eq('user_id', session?.user?.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Save cycle to database
  const saveCycleMutation = useMutation({
    mutationFn: async (startDate: Date) => {
      const { error } = await supabase
        .from('workout_cycles')
        .insert({
          user_id: session?.user?.id,
          start_date: format(startDate, 'yyyy-MM-dd'),
          is_active: true,
          completed_days: 0
        });

      if (error) throw error;
    },
  });

  // Update cycle progress
  const updateCycleMutation = useMutation({
    mutationFn: async ({ id, completedDays, isActive }: { id: number; completedDays: number; isActive: boolean }) => {
      const { error } = await supabase
        .from('workout_cycles')
        .update({
          completed_days: completedDays,
          is_active: isActive,
          completed_at: !isActive ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;
    },
  });

  // Send payment reminder
  const sendReminderMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('send-payment-reminder', {
        body: {
          email: session?.user?.email,
          name: session?.user?.email?.split('@')[0] || 'Gym Member'
        },
      });

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (currentCycle?.start_date && session?.user?.id) {
      // Count actual workout days since cycle start
      const cycleStartDate = new Date(currentCycle.start_date);
      const workoutDaysSinceCycleStart = workoutDates.filter(date => 
        !isBefore(new Date(date), cycleStartDate)
      ).length;

      if (workoutDaysSinceCycleStart >= CYCLE_DAYS && currentCycle.is_active) {
        setIsComplete(true);
        updateCycleMutation.mutate({
          id: currentCycle.id,
          completedDays: CYCLE_DAYS,
          isActive: false
        });
        
        // Send payment reminder
        if (currentCycle.notifications_enabled) {
          sendReminderMutation.mutate();
        }
        
        toast.success("Congratulations! You've completed your 12-day workout cycle! 🎉");
      } else if (currentCycle.is_active) {
        updateCycleMutation.mutate({
          id: currentCycle.id,
          completedDays: workoutDaysSinceCycleStart,
          isActive: true
        });
      }
    }
  }, [currentCycle, workoutDates, session?.user?.id]);

  const handleDateSelect = async (date: Date | undefined) => {
    if (!date || !session?.user?.id) return;
    
    const today = new Date();
    
    if (isAfter(date, today)) {
      toast.error("Cannot select a future date");
      return;
    }
    
    if (currentCycle?.is_active && !isComplete) {
      toast.error("Cannot start new cycle before completion");
      return;
    }

    try {
      await saveCycleMutation.mutateAsync(date);
      localStorage.setItem(STORAGE_KEY, date.toISOString());
      refetchCycle();
      toast.success("Workout cycle started!");
    } catch (error) {
      console.error("Error saving cycle:", error);
      toast.error("Failed to start workout cycle");
    }
  };

  const progress = currentCycle 
    ? (currentCycle.completed_days / CYCLE_DAYS) * 100 
    : 0;

  const daysLeft = currentCycle?.is_active 
    ? CYCLE_DAYS - (currentCycle.completed_days || 0)
    : CYCLE_DAYS;

  return (
    <Card className={`flex flex-col ${compact ? 'gap-2 p-2.5' : 'gap-3 p-4'}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className={`font-semibold ${compact ? 'text-sm' : ''}`}>Workout Cycle</h3>
          {currentCycle?.start_date ? (
            <>
              <p className={`text-muted-foreground ${compact ? 'text-[10px]' : 'text-sm'}`}>
                Started: {format(new Date(currentCycle.start_date), compact ? 'MMM d' : 'MMM d, yyyy')}
              </p>
              {currentCycle.is_active && (
                <p className={compact ? 'text-xs' : 'text-sm'}>
                  {daysLeft} days left
                </p>
              )}
            </>
          ) : (
            <p className={`text-muted-foreground ${compact ? 'text-[10px]' : 'text-sm'}`}>
              Set your first workout day
            </p>
          )}
        </div>
        
        {(!currentCycle?.is_active || !currentCycle) && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size={compact ? "sm" : "default"} className={compact ? 'text-xs' : ''}>
                <CalendarIcon className={compact ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'} />
                {compact ? 'Set' : 'Set First Day'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={currentCycle?.start_date ? new Date(currentCycle.start_date) : undefined}
                onSelect={handleDateSelect}
                disabled={(date) => isAfter(date, new Date())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )}
      </div>

      {currentCycle?.is_active && (
        <Progress
          value={progress}
          className={compact ? 'h-1.5' : 'h-2'}
        />
      )}
    </Card>
  );
}
