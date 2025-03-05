
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CustomTooltip } from "../CustomTooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import type { WorkoutLog } from "@/components/saved-exercises/types";
import { CATEGORY_COLORS } from "@/lib/constants";
import { format, subMonths } from "date-fns";
import { TimeRange } from "./CategoryDistributionChart";

interface MaxWeightChartProps {
  workoutLogs: WorkoutLog[];
  timeRange: TimeRange;
}

export function MaxWeightChart({ workoutLogs, timeRange }: MaxWeightChartProps) {
  const isMobile = useIsMobile();

  const getFilteredData = () => {
    const now = new Date();
    const ranges = {
      "1M": subMonths(now, 1),
      "3M": subMonths(now, 3),
      "6M": subMonths(now, 6),
      "1Y": subMonths(now, 12),
      "ALL": new Date(0)
    };
    
    return workoutLogs.filter(log => 
      new Date(log.workout_date) >= ranges[timeRange]
    );
  };

  const filteredLogs = getFilteredData();

  interface ExerciseData {
    weight: number;
    category: string;
    color: string;
  }

  const maxWeightData = Object.entries(
    filteredLogs.reduce((acc: Record<string, ExerciseData>, log) => {
      const exerciseName = log.custom_exercise || log.exercises?.name;
      if (!exerciseName || !log.weight_kg) return acc;
      
      if (!acc[exerciseName] || acc[exerciseName].weight < log.weight_kg) {
        acc[exerciseName] = { 
          weight: log.weight_kg,
          category: log.category,
          color: CATEGORY_COLORS[log.category as keyof typeof CATEGORY_COLORS]
        };
      }
      return acc;
    }, {})
  )
    .map(([exercise, data]) => ({
      exercise,
      maxWeight: data.weight,
      category: data.category,
      color: data.color
    }))
    .sort((a, b) => b.maxWeight - a.maxWeight)
    .slice(0, 10);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.1 }}
      className="col-span-full lg:col-span-1"
    >
      <Card className="p-3">
        <h2 className="text-base font-semibold mb-3">Max Weight Per Exercise</h2>
        <div className="h-[500px] sm:h-[450px] -mx-3 sm:mx-0">
          <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={maxWeightData}
                layout="vertical"
                margin={{
                  left: isMobile ? 65 : 100,
                  right: isMobile ? 12 : 20,
                  top: 5,
                  bottom: 15,
                }}
                barCategoryGap={isMobile ? 4 : 6}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  horizontal={true}
                  vertical={false}
                />
                <XAxis 
                  type="number"
                  tickFormatter={(value) => `${value}kg`}
                  domain={[0, "auto"]}
                  label={{ 
                    value: "Weight (kg)", 
                    position: "insideBottom",
                    offset: -8,
                    fontSize: isMobile ? 9 : 11
                  }}
                  tick={{ 
                    fontSize: isMobile ? 9 : 11,
                    fill: "currentColor"
                  }}
                />
                <YAxis 
                  type="category" 
                  dataKey="exercise" 
                  width={isMobile ? 60 : 90}
                  tick={{ 
                    fontSize: isMobile ? 9 : 11,
                    fill: "currentColor",
                    width: isMobile ? 55 : 85,
                    dy: 3
                  }}
                  tickFormatter={(value) => {
                    const maxChars = isMobile ? 10 : 13;
                    if (value.length > maxChars) {
                      return value.substring(0, maxChars) + "...";
                    }
                    return value;
                  }}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ fill: "transparent" }}
                />
                <Bar 
                  dataKey="maxWeight"
                  name="Max Weight"
                  minPointSize={2}
                  barSize={isMobile ? 16 : 22}
                >
                  {maxWeightData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={entry.color}
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
