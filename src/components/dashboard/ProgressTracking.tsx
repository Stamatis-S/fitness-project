
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { format } from "date-fns";
import { toast } from "sonner";
import type { WorkoutLog } from "@/pages/Dashboard";
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

  const exerciseNames = useMemo(() => {
    const names = new Set<string>();
    workoutLogs.forEach(log => {
      const name = log.custom_exercise || log.exercises?.name;
      if (name) names.add(name);
    });
    return Array.from(names);
  }, [workoutLogs]);

  const progressData = useMemo(() => {
    const dataByDate = new Map<string, { [key: string]: number }>();

    workoutLogs.forEach(log => {
      const date = format(new Date(log.workout_date), 'MMM yyyy');
      const exercise = log.custom_exercise || log.exercises?.name;
      if (!exercise) return;

      if (!dataByDate.has(date)) {
        dataByDate.set(date, {});
      }
      const dateData = dataByDate.get(date)!;
      dateData[exercise] = Math.max(dateData[exercise] || 0, log.weight_kg);
    });

    return Array.from(dataByDate.entries()).map(([date, values]) => ({
      date,
      ...values,
    }));
  }, [workoutLogs]);

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <h2 className="text-xl font-semibold">Progress Over Time</h2>
        <Button
          variant="outline"
          onClick={() => setCompareMode(!compareMode)}
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
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
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
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
