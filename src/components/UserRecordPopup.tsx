import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";

interface UserRecord {
  user_id: string;
  username: string;
  exercise: string;
  achievement: string;
  date: string;
}

export function UserRecordPopup() {
  const [records, setRecords] = useState<UserRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLatestRecords() {
      setIsLoading(true);
      try {
        // Fetch workout logs with user info and exercise details
        const { data: workoutLogs, error } = await supabase
          .from('workout_logs')
          .select(`
            id,
            user_id,
            exercise_id,
            custom_exercise,
            weight_kg,
            reps,
            workout_date,
            exercises(name),
            profiles(username)
          `)
          .order('weight_kg', { ascending: false })
          .limit(50); // Increased limit to get more potential records

        if (error) throw error;

        // Format the records
        if (workoutLogs && workoutLogs.length > 0) {
          // First, group by user and exercise to find PRs
          const exerciseMap = new Map<string, Map<string, UserRecord>>();
          
          workoutLogs.forEach(log => {
            const exerciseName = log.custom_exercise || log.exercises?.name || 'Unknown Exercise';
            const userExerciseKey = `${log.user_id}-${exerciseName}`;
            
            const record = {
              user_id: log.user_id,
              username: log.profiles?.username || 'Anonymous User',
              exercise: exerciseName,
              achievement: `${log.weight_kg}kg x ${log.reps} reps`,
              date: new Date(log.workout_date).toLocaleDateString()
            };

            // For each user-exercise combination, keep the highest weight
            if (!exerciseMap.has(userExerciseKey) || 
                parseFloat(record.achievement) > parseFloat(exerciseMap.get(userExerciseKey)!.get(log.user_id)!.achievement)) {
              if (!exerciseMap.has(userExerciseKey)) {
                exerciseMap.set(userExerciseKey, new Map());
              }
              exerciseMap.get(userExerciseKey)!.set(log.user_id, record);
            }
          });

          // Flatten the maps to get all PRs
          const allRecords: UserRecord[] = [];
          exerciseMap.forEach(userMap => {
            userMap.forEach(record => {
              allRecords.push(record);
            });
          });

          // Sort by achievement (weight) descending and take top 10
          const sortedRecords = allRecords
            .sort((a, b) => parseFloat(b.achievement) - parseFloat(a.achievement))
            .slice(0, 10);

          setRecords(sortedRecords);
        }
      } catch (error) {
        console.error('Error fetching records:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLatestRecords();

    // Set automatic cycling
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => 
        records.length > 0 ? (prevIndex + 1) % records.length : 0
      );
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [records.length]);

  const currentRecord = records[currentIndex];

  if (isLoading) {
    return (
      <div className="w-64 bg-[#1A1F2C] border border-gray-700 text-white p-1.5 mx-auto rounded-md">
        <p className="text-xs text-center">Loading records...</p>
      </div>
    );
  }

  if (!currentRecord) {
    return (
      <div className="w-64 bg-[#1A1F2C] border border-gray-700 text-white p-1.5 mx-auto rounded-md">
        <p className="text-xs text-center">No user records found</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="w-64 bg-[#1A1F2C] border border-gray-700 text-white p-1.5 mx-auto rounded-md">
        <motion.div
          key={currentRecord.user_id}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          className="space-y-0.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Trophy className="h-3 w-3 text-amber-500 flex-shrink-0" />
              <span className="font-semibold text-xs truncate">
                {currentRecord.username}
              </span>
            </div>
            <span className="text-xs text-gray-400">{currentRecord.date}</span>
          </div>
          <div className="ml-4.5 text-xs">
            <span className="text-emerald-400">{currentRecord.exercise}</span>
            <span className="text-xs text-gray-300 ml-1.5">
              {currentRecord.achievement}
            </span>
          </div>
          <div className="flex justify-between items-center mt-0.5 pt-0.5 border-t border-gray-700">
            <span className="text-xs text-gray-400">
              {currentIndex + 1} of {records.length}
            </span>
            <div className="flex gap-0.5">
              {records.map((_, idx) => (
                <button
                  key={idx}
                  className={`h-1 w-1 rounded-full ${
                    idx === currentIndex ? "bg-purple-500" : "bg-gray-600"
                  }`}
                  onClick={() => setCurrentIndex(idx)}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
