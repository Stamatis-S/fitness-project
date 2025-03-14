
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type TimeRange = "1M" | "3M" | "6M" | "1Y" | "ALL";

interface StatisticsTimeRangeSelectorProps {
  timeRange: TimeRange;
  setTimeRange: (value: TimeRange) => void;
  isMobile: boolean;
}

export function StatisticsTimeRangeSelector({ 
  timeRange, 
  setTimeRange,
  isMobile
}: StatisticsTimeRangeSelectorProps) {
  return (
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
  );
}
