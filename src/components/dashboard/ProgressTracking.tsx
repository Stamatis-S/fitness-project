
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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

  // Filter exercises based on search term
  const filteredExercises = useMemo(() => {
    return searchTerm 
      ? exerciseNames.filter(name => 
          name.toLowerCase().includes(searchTerm.toLowerCase()))
      : exerciseNames;
  }, [exerciseNames, searchTerm]);

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

  return (
    <Card className="p-6 bg-[#1E1E1E] border-[#333333]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <h2 className="text-xl font-semibold text-white">Progress Over Time</h2>
        <Button
          variant="outline"
          onClick={() => {
            if (!compareMode && selectedExercises.length > 2) {
              setSelectedExercises(prev => prev.slice(0, 2));
            }
            setCompareMode(!compareMode);
          }}
          className="shrink-0 bg-[#333333] text-white border-[#444444] hover:bg-[#444444]"
        >
          {compareMode ? "Exit Compare Mode" : "Compare Exercises"}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
        {/* Exercise selector - takes 3/12 columns on large screens */}
        <div className="lg:col-span-3">
          <h3 className="text-sm font-medium mb-2 text-gray-300">Select Exercises</h3>
          <div className="bg-[#252525] border border-[#333333] rounded-md p-3">
            <div className="relative mb-3">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-sm bg-[#333333] border-[#444444] text-white"
              />
            </div>
            
            <div className="max-h-[200px] overflow-y-auto pr-1 grid grid-cols-1 gap-1">
              {filteredExercises.length === 0 ? (
                <p className="text-gray-400 text-sm p-2">No exercises found</p>
              ) : (
                filteredExercises.map(name => (
                  <TooltipProvider key={name}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center space-x-3 p-2 hover:bg-[#333333] rounded-md transition-colors">
                          <Checkbox
                            checked={selectedExercises.includes(name)}
                            onCheckedChange={(checked) => toggleExercise(name, checked)}
                            className="border-[#555555] data-[state=checked]:bg-[#E22222] data-[state=checked]:border-[#E22222]"
                          />
                          <label className="text-sm font-medium text-gray-200 cursor-pointer whitespace-normal break-words">
                            {name}
                          </label>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#333333] text-white border-[#444444]">
                        <p>{name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* Graph area - takes 9/12 columns on large screens */}
        <div className="lg:col-span-9">
          <div className="h-[400px] bg-[#252525] border border-[#333333] rounded-md p-4">
            {progressData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={progressData}
                  margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333333" opacity={0.4} />
                  <XAxis
                    dataKey="date"
                    angle={-35}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 12, fill: "#CCCCCC" }}
                    padding={{ left: 10, right: 10 }}
                    stroke="#555555"
                  />
                  <YAxis
                    label={{ 
                      value: 'Weight (kg)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fontSize: 12, fill: "#CCCCCC" }
                    }}
                    tick={{ fontSize: 12, fill: "#CCCCCC" }}
                    stroke="#555555"
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: 10, fontSize: 12 }}
                    align="center"
                    formatter={(value) => <span style={{ color: "#FFFFFF" }}>{value}</span>}
                  />
                  {selectedExercises
                    .slice(0, compareMode ? 2 : undefined)
                    .map((exercise, index) => (
                      <Line
                        key={exercise}
                        type="monotone"
                        dataKey={exercise}
                        stroke={COLORS[index % COLORS.length]}
                        dot={{ r: 4, strokeWidth: 1, fill: "#252525" }}
                        activeDot={{ r: 6, strokeWidth: 2, fill: "#252525" }}
                        connectNulls
                        strokeWidth={2}
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                {selectedExercises.length === 0 
                  ? "Select exercises to view progress"
                  : "No data available for selected exercises"}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
