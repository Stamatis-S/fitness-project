import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
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
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronUp } from "lucide-react";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [showExercises, setShowExercises] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (!session) {
    navigate('/auth');
    return null;
  }

  if (!Array.isArray(workoutLogs)) {
    console.error('Invalid workoutLogs:', workoutLogs);
    return <Card className="p-6">Loading...</Card>;
  }

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

  const filteredExercises = useMemo(() => {
    return searchTerm 
      ? exerciseNames.filter(name => 
          name.toLowerCase().includes(searchTerm.toLowerCase()))
      : exerciseNames;
  }, [exerciseNames, searchTerm]);

  const progressData = useMemo(() => {
    try {
      const dataMap = new Map<string, Map<string, { totalWeight: number; totalReps: number }>>();
      
      const sortedLogs = [...workoutLogs]
        .filter(log => log && log.workout_date && log.weight_kg && log.reps)
        .sort((a, b) => {
          const dateA = new Date(a.workout_date).getTime();
          const dateB = new Date(b.workout_date).getTime();
          return dateA - dateB;
        });

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


  if (!progressData.length && selectedExercises.length > 0) {
    return (
      <Card className="p-6">
        <div className="text-center">No data available for selected exercises</div>
      </Card>
    );
  }

  const toggleExercise = (name: string, checked: boolean | "indeterminate") => {
    if (compareMode && selectedExercises.length >= 2 && checked) {
      toast.error("Can only compare two exercises at a time");
      return;
    }
    setSelectedExercises(prev =>
      checked
        ? [...prev, name]
        : prev.filter(e => e !== name)
    );
  };

  const getTickInterval = () => {
    if (progressData.length <= 5) return 0;
    if (progressData.length <= 10) return 1;
    if (progressData.length <= 15) return 2;
    return Math.floor(progressData.length / 8);
  };

  return (
    <Card className="p-3 bg-card border-border">
      {/* Header - Compact on mobile */}
      <div className="flex justify-between items-center gap-2 mb-3">
        <h2 className={`font-semibold text-foreground ${isMobile ? 'text-base' : 'text-xl'}`}>
          Progress Over Time
        </h2>
        <Button
          variant="outline"
          size={isMobile ? "sm" : "default"}
          onClick={() => {
            if (!compareMode && selectedExercises.length > 2) {
              setSelectedExercises(prev => prev.slice(0, 2));
            }
            setCompareMode(!compareMode);
          }}
          className="shrink-0 text-xs"
        >
          {compareMode ? "Exit Compare" : "Compare"}
        </Button>
      </div>
      
      {/* Exercise Selector - Collapsible on mobile */}
      <div className="mb-3">
        <button
          onClick={() => setShowExercises(!showExercises)}
          className="flex items-center justify-between w-full p-2 bg-muted rounded-lg text-sm"
        >
          <span className="text-muted-foreground">
            {selectedExercises.length > 0 
              ? `${selectedExercises.length} exercise(s) selected` 
              : "Select exercises"}
          </span>
          {showExercises ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        
        {showExercises && (
          <div className="mt-2 bg-muted border border-border rounded-lg p-2">
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 h-8 text-xs"
              />
            </div>
            
            <div className={`overflow-y-auto pr-1 grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-1`} style={{ maxHeight: isMobile ? '150px' : '200px' }}>
              {filteredExercises.length === 0 ? (
                <p className="text-muted-foreground text-xs p-1 col-span-full">No exercises found</p>
              ) : (
                filteredExercises.map(name => (
                  <div 
                    key={name} 
                    className="flex items-center space-x-1.5 p-1.5 hover:bg-accent rounded transition-colors cursor-pointer"
                    onClick={() => toggleExercise(name, !selectedExercises.includes(name))}
                  >
                    <Checkbox
                      checked={selectedExercises.includes(name)}
                      onCheckedChange={(checked) => toggleExercise(name, checked)}
                      className="h-3.5 w-3.5 pointer-events-none"
                    />
                    <span className="text-xs text-foreground truncate flex-1">
                      {name}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Chart - Compact height on mobile */}
      <div className={`bg-muted border border-border rounded-lg p-2 ${isMobile ? 'h-[280px]' : 'h-[400px]'}`}>
        {progressData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={progressData}
              margin={isMobile 
                ? { top: 5, right: 10, left: 0, bottom: 50 }
                : { top: 10, right: 20, left: 10, bottom: 70 }
              }
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis
                dataKey="date"
                angle={-45}
                textAnchor="end"
                height={isMobile ? 50 : 70}
                tick={{ fontSize: isMobile ? 9 : 11, fill: "hsl(var(--muted-foreground))" }}
                stroke="hsl(var(--border))"
                interval={getTickInterval()}
                tickMargin={10}
              />
              <YAxis
                tick={{ fontSize: isMobile ? 10 : 12, fill: "hsl(var(--muted-foreground))" }}
                stroke="hsl(var(--border))"
                domain={['auto', 'auto']}
                width={isMobile ? 35 : 45}
                tickFormatter={(val) => `${val}kg`}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              {!isMobile && (
                <Legend 
                  wrapperStyle={{ paddingTop: 10, fontSize: 12 }}
                  align="center"
                />
              )}
              {selectedExercises
                .slice(0, compareMode ? 2 : undefined)
                .map((exercise, index) => (
                  <Line
                    key={exercise}
                    type="monotone"
                    dataKey={exercise}
                    stroke={COLORS[index % COLORS.length]}
                    dot={{ r: isMobile ? 2 : 4, strokeWidth: 1 }}
                    activeDot={{ r: isMobile ? 4 : 6, strokeWidth: 2 }}
                    connectNulls
                    strokeWidth={isMobile ? 1.5 : 2}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            {selectedExercises.length === 0 
              ? "Select exercises to view progress"
              : "No data available"}
          </div>
        )}
      </div>
      
      {/* Selected exercises chips on mobile */}
      {isMobile && selectedExercises.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedExercises.map((exercise, index) => (
            <span 
              key={exercise}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] + '20', color: COLORS[index % COLORS.length] }}
            >
              {exercise.length > 15 ? exercise.substring(0, 15) + '...' : exercise}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
