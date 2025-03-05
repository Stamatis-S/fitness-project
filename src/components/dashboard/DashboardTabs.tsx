
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { WorkoutInsights } from "./WorkoutInsights";
import { DashboardOverview } from "./DashboardOverview";
import { ProgressTracking } from "./ProgressTracking";
import { DashboardStatistics } from "./DashboardStatistics";
import type { WorkoutLog } from "@/components/saved-exercises/types";

interface DashboardTabsProps {
  workoutLogs: WorkoutLog[];
}

export function DashboardTabs({ workoutLogs }: DashboardTabsProps) {
  const isMobile = useIsMobile();

  return (
    <Tabs defaultValue="overview" className="w-full">
      <div className={`${isMobile ? 'sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-1 px-2 rounded-t-lg' : 'px-3 pt-3'}`}>
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3 gap-1' : 'grid-cols-3'}`}>
          <TabsTrigger value="overview" className={isMobile ? 'text-xs py-1.5' : 'text-sm py-1.5'}>Overview</TabsTrigger>
          <TabsTrigger value="progress" className={isMobile ? 'text-xs py-1.5' : 'text-sm py-1.5'}>Progress</TabsTrigger>
          <TabsTrigger value="statistics" className={isMobile ? 'text-xs py-1.5' : 'text-sm py-1.5'}>Statistics</TabsTrigger>
        </TabsList>
      </div>

      <div className="p-2 md:p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3 mb-3">
          <WorkoutInsights logs={workoutLogs} />
        </div>

        <TabsContent value="overview" className="m-0 space-y-2 md:space-y-3">
          {workoutLogs && <DashboardOverview workoutLogs={workoutLogs} />}
        </TabsContent>

        <TabsContent value="progress" className="m-0 space-y-2 md:space-y-3">
          {workoutLogs && <ProgressTracking workoutLogs={workoutLogs} />}
        </TabsContent>

        <TabsContent value="statistics" className="m-0 space-y-2 md:space-y-3">
          {workoutLogs && <DashboardStatistics workoutLogs={workoutLogs} />}
        </TabsContent>
      </div>
    </Tabs>
  );
}
