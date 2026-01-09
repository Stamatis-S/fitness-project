
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { CustomTooltip } from "../CustomTooltip";
import type { ExerciseCategory } from "@/lib/constants";

interface CategoryData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface CategoryDistributionChartProps {
  categoryDistribution: CategoryData[];
  isMobile: boolean;
}

interface LabelProps {
  percentage: number;
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
}

export function CategoryDistributionChart({ 
  categoryDistribution,
  isMobile
}: CategoryDistributionChartProps) {
  // Compact label for mobile - only show if percentage > 5%
  const renderCustomLabel = ({ percentage, cx, cy, midAngle, innerRadius, outerRadius }: LabelProps) => {
    if (isMobile && percentage < 8) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * (isMobile ? 1.3 : 1.2);
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="hsl(var(--foreground))"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={isMobile ? "9px" : "12px"}
        fontWeight="500"
      >
        {`${percentage}%`}
      </text>
    );
  };

  return (
    <div className={`${isMobile ? "h-[240px]" : "h-[380px]"} w-full`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={categoryDistribution}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy={isMobile ? "45%" : "50%"}
            outerRadius={isMobile ? 70 : 140}
            innerRadius={isMobile ? 25 : 50}
            label={renderCustomLabel}
            labelLine={isMobile ? false : {
              stroke: "hsl(var(--muted-foreground))",
              strokeWidth: 0.5,
              strokeOpacity: 0.5,
            }}
            paddingAngle={1}
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
            iconSize={isMobile ? 8 : 10}
            wrapperStyle={{ 
              paddingTop: isMobile ? "8px" : "16px",
              fontSize: isMobile ? "9px" : "12px"
            }}
            formatter={(value) => (
              <span className="text-foreground">
                {isMobile && value.length > 8 ? value.substring(0, 8) + '...' : value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
