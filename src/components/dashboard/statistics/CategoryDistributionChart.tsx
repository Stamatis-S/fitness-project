
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomTooltip } from "../CustomTooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import type { WorkoutLog } from "@/components/saved-exercises/types";
import { CATEGORY_COLORS } from "@/lib/constants";
import { format, subMonths } from "date-fns";

export type TimeRange = "1M" | "3M" | "6M" | "1Y" | "ALL";

interface CategoryDistributionChartProps {
  workoutLogs: WorkoutLog[];
  timeRange: TimeRange;
  setTimeRange: (value: TimeRange) => void;
}

export function CategoryDistributionChart({ 
  workoutLogs, 
  timeRange, 
  setTimeRange 
}: CategoryDistributionChartProps) {
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
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="col-span-full"
    >
      <Card className="p-3 col-span-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
          <h2 className="text-base font-semibold">Statistics Overview</h2>
          <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
            <SelectTrigger className="w-[120px] h-7 text-xs">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1M">Last Month</SelectItem>
              <SelectItem value="3M">Last 3 Months</SelectItem>
              <SelectItem value="6M">Last 6 Months</SelectItem>
              <SelectItem value="1Y">Last Year</SelectItem>
              <SelectItem value="ALL">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className={`${isMobile ? "h-[300px]" : "h-[350px]"}`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={isMobile ? 80 : 120}
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
                  paddingTop: "15px",
                  fontSize: isMobile ? "8px" : "10px"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
}
