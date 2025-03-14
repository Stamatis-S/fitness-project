
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import type { WorkoutLog } from "@/components/saved-exercises/types";
import { CustomTooltip } from "./CustomTooltip";
import { format, subMonths } from "date-fns";
import { CATEGORY_COLORS } from "@/lib/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ExerciseCategory } from "@/lib/constants";

interface DashboardStatisticsProps {
  workoutLogs: WorkoutLog[];
}

type TimeRange = "1M" | "3M" | "6M" | "1Y" | "ALL";

interface ExerciseData {
  weight: number;
  category: string;
  color: string;
}

export function DashboardStatistics({ workoutLogs }: DashboardStatisticsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("3M");
  const isMobile = useIsMobile();
  const { session } = useAuth();
  const navigate = useNavigate();

  if (!session) {
    navigate('/auth');
    return null;
  }

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

  const categoryDistribution = filteredLogs.reduce((acc: any[], log) => {
    const existingCategory = acc.find(cat => cat.name === log.category);
    if (existingCategory) {
      existingCategory.value++;
    } else {
      acc.push({ 
        name: log.category, 
        value: 1,
        color: CATEGORY_COLORS[log.category as keyof typeof CATEGORY_COLORS]
      });
    }
    return acc;
  }, []);

  const total = categoryDistribution.reduce((sum, item) => sum + item.value, 0);
  categoryDistribution.forEach(item => {
    item.percentage = Number(((item.value / total) * 100).toFixed(1));
  });

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

  const renderCustomLabel = ({ percentage, cx, cy, midAngle, innerRadius, outerRadius }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="currentColor"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={isMobile ? "10px" : "12px"}
        fontWeight="500"
      >
        {`${percentage}%`}
      </text>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-3">
      <Card className="p-3 col-span-full bg-[#1E1E1E] border-[#333333]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
          <h2 className="text-xl font-semibold text-white">Statistics Overview</h2>
          <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
            <SelectTrigger className="w-[140px] bg-[#333333] text-white border-[#444444]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent className="bg-[#252525] border-[#444444] text-white">
              <SelectItem value="1M" className="focus:bg-[#333333] focus:text-white">Last Month</SelectItem>
              <SelectItem value="3M" className="focus:bg-[#333333] focus:text-white">Last 3 Months</SelectItem>
              <SelectItem value="6M" className="focus:bg-[#333333] focus:text-white">Last 6 Months</SelectItem>
              <SelectItem value="1Y" className="focus:bg-[#333333] focus:text-white">Last Year</SelectItem>
              <SelectItem value="ALL" className="focus:bg-[#333333] focus:text-white">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className={`${isMobile ? "h-[340px]" : "h-[450px]"} w-full`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={isMobile ? 120 : 180}
                innerRadius={isMobile ? 40 : 60}
                label={renderCustomLabel}
                labelLine={{
                  stroke: "currentColor",
                  strokeWidth: 0.5,
                  strokeOpacity: 0.5,
                  type: "polyline"
                }}
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="horizontal"
                align="center"
                verticalAlign="bottom"
                wrapperStyle={{ 
                  paddingTop: "20px",
                  fontSize: isMobile ? "10px" : "12px"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-3 bg-[#1E1E1E] border-[#333333]">
        <h2 className="text-xl font-semibold mb-3 text-white">Max Weight Per Exercise</h2>
        <div className="h-[500px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={maxWeightData}
              layout="vertical"
              margin={{
                left: isMobile ? 55 : 80,
                right: 5,
                top: 5,
                bottom: 20,
              }}
              barCategoryGap={isMobile ? 3 : 5}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                horizontal={true}
                vertical={false}
                stroke="#444444"
              />
              <XAxis 
                type="number"
                tickFormatter={(value) => `${value}kg`}
                domain={[0, "auto"]}
                tick={{ 
                  fontSize: isMobile ? 10 : 12,
                  fill: "#CCCCCC"
                }}
                stroke="#555555"
              />
              <YAxis 
                type="category" 
                dataKey="exercise" 
                width={isMobile ? 55 : 80}
                tick={{ 
                  fontSize: isMobile ? 9 : 11,
                  fill: "#CCCCCC",
                  width: isMobile ? 55 : 75,
                }}
                tickFormatter={(value) => {
                  const maxChars = isMobile ? 8 : 12;
                  if (value.length > maxChars) {
                    return value.substring(0, maxChars) + "...";
                  }
                  return value;
                }}
                stroke="#555555"
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
              />
              <Bar 
                dataKey="maxWeight"
                name="Max Weight"
                minPointSize={2}
                barSize={isMobile ? 14 : 18}
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
      </Card>
    </div>
  );
}
