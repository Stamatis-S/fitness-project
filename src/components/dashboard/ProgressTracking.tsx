
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import type { WorkoutLog } from "@/components/saved-exercises/types";
import { CustomTooltip } from "./CustomTooltip";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7c43",
  "#f95d6a",
  "#665191",
  "#2f4b7c",
  "#a05195",
  "#d45087",
  "#f95d6a",
];

interface ProgressTrackingProps {
  workoutLogs: WorkoutLog[];
}

export function ProgressTracking({ workoutLogs }: ProgressTrackingProps) {
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();

  if (!session) {
    navigate('/auth');
    return null;
  }

  // Validate workout logs
  if (!Array.isArray(workoutLogs)) {
    console.error('Invalid workoutLogs:', workoutLogs);
    return <Card className="p-6">Loading...</Card>;
  }

  // Get unique exercise names from logs with validation
  const exerciseNames = useMemo(() => {
    try {
      const names = new Set<string>();
      workoutLogs.forEach(log => {
        if (!log) return;
        const name = log.custom_exercise || (log.exercises && log.exercises.name);
        if (name) names.add(name);
      });
      return Array.from(names);
    } catch (error) {
      console.error('Error processing exercise names:', error);
      return [];
    }
  }, [workoutLogs]);

  // Process workout data for the chart with weighted averages
  const progressData = useMemo(() => {
    try {
      const dataMap = new Map<string, Map<string, { totalWeight: number; totalReps: number }>>();
      
      const sortedLogs = [...workoutLogs]
        .filter(log => log && log.workout_date && log.weight_kg && log.reps) // Filter out invalid logs
        .sort((a, b) => {
          const dateA = new Date(a.workout_date).getTime();
          const dateB = new Date(b.workout_date).getTime();
          return dateA - dateB;
        });

      // Group by date and exercise, accumulate weights and reps
      sortedLogs.forEach(log => {
        if (!log.workout_date || !log.weight_kg || !log.reps) return;
        
        const date = log.workout_date;
        const exercise = log.custom_exercise || (log.exercises && log.exercises.name);
        
        if (!exercise) return;
        
        if (!dataMap.has(date)) {
          dataMap.set(date, new Map());
        }
        
        const exerciseMap = dataMap.get(date)!;
        if (!exerciseMap.has(exercise)) {
          exerciseMap.set(exercise, { totalWeight: 0, totalReps: 0 });
        }
        
        const current = exerciseMap.get(exercise)!;
        current.totalWeight += log.weight_kg * log.reps;
        current.totalReps += log.reps;
      });

      // Convert accumulated data to weighted averages
      return Array.from(dataMap.entries())
        .map(([date, exerciseMap]) => {
          try {
            const dataPoint: Record<string, any> = {
              date: format(parseISO(date), 'MMM d, yyyy'),
              rawDate: date,
            };
            
            selectedExercises.forEach(exercise => {
              const exerciseData = exerciseMap.get(exercise);
              if (exerciseData && exerciseData.totalReps > 0) {
                // Calculate weighted average
                dataPoint[exercise] = Number((exerciseData.totalWeight / exerciseData.totalReps).toFixed(2));
              } else {
                dataPoint[exercise] = null;
              }
            });
            
            return dataPoint;
          } catch (error) {
            console.error('Error processing data point:', error);
            return null;
          }
        })
        .filter(Boolean)
        .sort((a, b) => new Date(a!.rawDate).getTime() - new Date(b!.rawDate).getTime());
    } catch (error) {
      console.error('Error processing progress data:', error);
      return [];
    }
  }, [workoutLogs, selectedExercises]);

  // Debug logging
  console.log('Chart Component State:', {
    selectedExercises,
    exerciseNames,
    progressDataLength: progressData.length,
    workoutLogsLength: workoutLogs.length,
  });

  if (!progressData.length && selectedExercises.length > 0) {
    return (
      <Card className="p-6">
        <div className="text-center">No data available for selected exercises</div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <h2 className="text-xl font-semibold">Progress Over Time</h2>
        <Button
          variant="outline"
          onClick={() => {
            if (!compareMode && selectedExercises.length > 2) {
              setSelectedExercises(prev => prev.slice(0, 2));
            }
            setCompareMode(!compareMode);
          }}
          className="shrink-0"
        >
          {compareMode ? "Exit Compare Mode" : "Compare Exercises"}
        </Button>
      </div>
      
      <ScrollArea className="h-[150px] w-full border rounded-md p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {exerciseNames.map(name => (
            <TooltipProvider key={name}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedExercises.includes(name)}
                      onCheckedChange={(checked) => {
                        if (compareMode && selectedExercises.length >= 2 && checked) {
                          toast.error("Can only compare two exercises at a time");
                          return;
                        }
                        setSelectedExercises(prev =>
                          checked
                            ? [...prev, name]
                            : prev.filter(e => e !== name)
                        );
                      }}
                    />
                    <label className="text-sm truncate">{name}</label>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </ScrollArea>
      
      <div className="h-[400px] mt-4">
        {progressData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={progressData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                label={{ 
                  value: 'Weighted Average (kg)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              {selectedExercises
                .slice(0, compareMode ? 2 : undefined)
                .map((exercise, index) => (
                  <Line
                    key={exercise}
                    type="monotone"
                    dataKey={exercise}
                    stroke={COLORS[index % COLORS.length]}
                    dot={{ r: 4 }}
                    connectNulls
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            {selectedExercises.length === 0 
              ? "Select exercises to view progress"
              : "No data available for selected exercises"}
          </div>
        )}
      </div>
    </Card>
  );
}
