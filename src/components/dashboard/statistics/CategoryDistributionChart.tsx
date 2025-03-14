
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

export function CategoryDistributionChart({ 
  categoryDistribution,
  isMobile
}: CategoryDistributionChartProps) {
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
  );
}
