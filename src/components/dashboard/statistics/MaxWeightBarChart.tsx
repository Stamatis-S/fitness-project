
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
  return (
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
  );
}
