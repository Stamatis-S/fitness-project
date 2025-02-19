
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";

interface PersonalRecord {
  exercise: string;
  achievement: string;
  type: 'new' | 'matched';
}

interface PRTrackerProps {
  records: PersonalRecord[];
}

export function PRTracker({ records }: PRTrackerProps) {
  // Filter to show only new PRs
  const newRecords = records.filter(record => record.type === 'new');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-muted-foreground">
        <div className="p-2 rounded-lg bg-primary/10">
          <Trophy className="h-6 w-6 text-primary" />
        </div>
        <span className="text-lg font-medium">New PRs This Week</span>
      </div>
      <div className="pl-12">
        {newRecords.length > 0 ? (
          <ul className="space-y-2">
            {newRecords.map((record, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2"
              >
                <span className="text-sm px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  New PR!
                </span>
                <p className="text-sm">
                  <span className="font-medium">{record.exercise}:</span> {record.achievement}
                </p>
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No new PRs this week. Keep pushing!</p>
        )}
      </div>
    </div>
  );
}
