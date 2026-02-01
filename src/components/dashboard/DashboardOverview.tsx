import React from "react";
import { Card } from "@/components/ui/card";
import type { WorkoutLog } from "@/components/saved-exercises/types";
import { motion } from "framer-motion";
import { PRTracker } from "./metrics/PRTracker";
import { WorkoutReports } from "./WorkoutReports";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { getPersonalRecords } from "./utils/metricCalculations";

interface DashboardOverviewProps {
  workoutLogs: WorkoutLog[];
}

export function DashboardOverview({ workoutLogs }: DashboardOverviewProps) {
  const { session } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (!session) {
    navigate('/auth');
    return null;
  }

  const personalRecords = getPersonalRecords(workoutLogs);

  return (
    <div className={`grid grid-cols-1 ${isMobile ? 'gap-2' : 'gap-4'}`}>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-full"
      >
        <Card className={isMobile ? 'p-2.5' : 'p-4'}>
          <PRTracker records={personalRecords} compact={isMobile} />
        </Card>
      </motion.div>

      <WorkoutReports workoutLogs={workoutLogs} compact={isMobile} />
    </div>
  );
}
