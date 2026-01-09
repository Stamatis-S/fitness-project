
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CustomTooltip } from "../CustomTooltip";

interface MaxWeightData {
  exercise: string;
  maxWeight: number;
  category: string;
  color: string;
}

interface MaxWeightBarChartProps {
  maxWeightData: MaxWeightData[];
  isMobile: boolean;
}

export function MaxWeightBarChart({ maxWeightData, isMobile }: MaxWeightBarChartProps) {
  // Show all 10 exercises
  const displayData = maxWeightData.slice(0, 10);
  const chartHeight = isMobile ? Math.max(200, displayData.length * 28) : 400;
  
  return (
    <div style={{ height: `${chartHeight}px` }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={displayData}
          layout="vertical"
          margin={{
            left: isMobile ? 2 : 5,
            right: isMobile ? 8 : 15,
            top: 5,
            bottom: 5,
          }}
          barCategoryGap={isMobile ? 2 : 4}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            horizontal={true}
            vertical={false}
            stroke="hsl(var(--border))"
            opacity={0.5}
          />
          <XAxis 
            type="number"
            tickFormatter={(value) => `${value}`}
            domain={[0, "auto"]}
            tick={{ 
              fontSize: isMobile ? 9 : 11,
              fill: "hsl(var(--muted-foreground))"
            }}
            stroke="hsl(var(--border))"
            tickCount={isMobile ? 4 : 6}
          />
          <YAxis 
            type="category" 
            dataKey="exercise" 
            width={isMobile ? 65 : 90}
            tick={{ 
              fontSize: isMobile ? 10 : 11,
              fill: "hsl(var(--foreground))",
            }}
            tickFormatter={(value) => {
              const maxChars = isMobile ? 9 : 14;
              if (value.length > maxChars) {
                return value.substring(0, maxChars) + "…";
              }
              return value;
            }}
            stroke="hsl(var(--border))"
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: "hsl(var(--accent) / 0.3)" }}
          />
          <Bar 
            dataKey="maxWeight"
            name="Max Weight (kg)"
            minPointSize={2}
            barSize={isMobile ? 16 : 20}
            radius={[0, 4, 4, 0]}
          >
            {displayData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={entry.color}
                className="hover:opacity-80 transition-opacity"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {maxWeightData.length > 10 && (
        <p className="text-xs text-muted-foreground text-center mt-2">
          Showing top 10 of {maxWeightData.length} exercises
        </p>
      )}
    </div>
  );
}
