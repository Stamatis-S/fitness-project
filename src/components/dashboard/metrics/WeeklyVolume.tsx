
import { Activity, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WeeklyVolumeProps {
  volume: number;
  percentChange: number;
}

export function WeeklyVolume({ volume, percentChange }: WeeklyVolumeProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-muted-foreground">
        <div className="p-2 rounded-lg bg-primary/10">
          <Activity className="h-6 w-6 text-primary" />
        </div>
        <span className="text-lg font-medium">Weekly Volume</span>
      </div>
      <div className="pl-12">
        <p className="text-3xl font-bold tracking-tight">{Math.round(volume).toLocaleString()} kg</p>
        <div className="flex items-center gap-2 mt-2">
          {percentChange !== 0 && (
            <motion.span 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className={cn(
                "flex items-center text-sm px-2 py-1 rounded-full",
                percentChange > 0 
                  ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
              )}
            >
              {percentChange > 0 ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {Math.abs(percentChange).toFixed(1)}%
            </motion.span>
          )}
          <span className="text-sm text-muted-foreground">vs last week</span>
        </div>
      </div>
    </div>
  );
}
