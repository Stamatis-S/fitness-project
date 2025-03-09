
import { supabase } from "@/integrations/supabase/client";
import { CreatureData, CreatureType, FitnessAspect, CreatureLevel, CreatureTimelinePoint } from "./types";
import { WorkoutLog } from "@/components/saved-exercises/types";

// Maps exercise categories to fitness aspects
const categoryToAspectMap: Record<string, FitnessAspect> = {
  "ΣΤΗΘΟΣ": "strength",
  "ΠΛΑΤΗ": "strength",
  "ΔΙΚΕΦΑΛΑ": "strength",
  "ΤΡΙΚΕΦΑΛΑ": "strength",
  "ΩΜΟΙ": "strength",
  "ΠΟΔΙΑ": "strength",
  "ΚΟΡΜΟΣ": "flexibility",
  "CARDIO": "endurance"
};

/**
 * Calculate the creature level based on fitness score
 */
export const calculateCreatureLevel = (fitnessScore: number): CreatureLevel => {
  if (fitnessScore >= 4500) return 5;
  if (fitnessScore >= 3000) return 4;
  if (fitnessScore >= 2000) return 3;
  if (fitnessScore >= 1000) return 2;
  return 1;
};

/**
 * Determine the creature type based on workout focus
 */
export const determineCreatureType = (
  workoutData: WorkoutLog[]
): CreatureType => {
  // Count exercises by category
  const categoryCounts: Record<string, number> = {};
  workoutData.forEach(log => {
    const category = log.category;
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });

  // Calculate percentages for strength categories (upper vs lower body)
  const upperBodyCategories = ["ΣΤΗΘΟΣ", "ΠΛΑΤΗ", "ΔΙΚΕΦΑΛΑ", "ΤΡΙΚΕΦΑΛΑ", "ΩΜΟΙ"];
  const lowerBodyCategories = ["ΠΟΔΙΑ"];
  
  const upperBodyCount = upperBodyCategories.reduce(
    (total, cat) => total + (categoryCounts[cat] || 0), 
    0
  );
  
  const lowerBodyCount = lowerBodyCategories.reduce(
    (total, cat) => total + (categoryCounts[cat] || 0), 
    0
  );
  
  const cardioCount = categoryCounts["CARDIO"] || 0;
  const flexibilityCount = categoryCounts["ΚΟΡΜΟΣ"] || 0;
  
  const totalWorkouts = workoutData.length;
  
  // Get percentages
  const upperBodyPercentage = (upperBodyCount / totalWorkouts) * 100;
  const lowerBodyPercentage = (lowerBodyCount / totalWorkouts) * 100;
  const cardioPercentage = (cardioCount / totalWorkouts) * 100;
  const flexibilityPercentage = (flexibilityCount / totalWorkouts) * 100;
  
  // Determine creature type based on highest percentage
  if (cardioPercentage > 40) return "Swift Runner";
  if (upperBodyPercentage > 40) return "Mighty Lifter";
  if (lowerBodyPercentage > 40) return "Grounded Powerhouse";
  if (flexibilityPercentage > 30) return "Flexible Master";
  return "Balanced Athlete";
};

/**
 * Calculate aspect scores based on workout history
 */
export const calculateAspectScores = (
  workoutData: WorkoutLog[]
): Record<FitnessAspect, number> => {
  // Initialize aspect scores
  const aspects: Record<FitnessAspect, number> = {
    strength: 0,
    endurance: 0,
    flexibility: 0,
    balance: 0
  };
  
  if (workoutData.length === 0) return aspects;

  // Group workouts by category
  const categoryVolumes: Record<string, number> = {};
  workoutData.forEach(log => {
    const volume = (log.weight_kg || 0) * (log.reps || 0);
    categoryVolumes[log.category] = (categoryVolumes[log.category] || 0) + volume;
  });
  
  // Calculate total volume
  const totalVolume = Object.values(categoryVolumes).reduce((total, volume) => total + volume, 0);
  
  // Map category volumes to aspect scores
  Object.entries(categoryVolumes).forEach(([category, volume]) => {
    const aspect = categoryToAspectMap[category] || "balance";
    aspects[aspect] += (volume / totalVolume) * 100;
  });
  
  // Normalize scores to ensure they add up to 100
  const totalScore = Object.values(aspects).reduce((total, score) => total + score, 0);
  
  if (totalScore > 0) {
    Object.keys(aspects).forEach(key => {
      aspects[key as FitnessAspect] = Math.min(100, (aspects[key as FitnessAspect] / totalScore) * 100);
    });
  }
  
  // Ensure balance aspect has at least a minimal value
  if (aspects.balance < 10) {
    aspects.balance = 10;
  }
  
  return aspects;
};

/**
 * Fetch all data needed for the creature
 */
export const fetchCreatureData = async (userId: string): Promise<CreatureData | null> => {
  try {
    // Fetch user's fitness score
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('fitness_score, fitness_level, last_score_update')
      .eq('id', userId)
      .single();
    
    if (profileError) throw profileError;
    
    // Fetch workout history
    const { data: workoutData, error: workoutError } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', userId);
    
    if (workoutError) throw workoutError;
    
    if (!profileData || !workoutData) return null;
    
    const level = calculateCreatureLevel(profileData.fitness_score);
    const type = determineCreatureType(workoutData);
    const aspects = calculateAspectScores(workoutData);
    
    return {
      level,
      type,
      aspects,
      lastEvolution: profileData.last_score_update
    };
  } catch (error) {
    console.error("Error fetching creature data:", error);
    return null;
  }
};

/**
 * Fetch timeline data for the creature's evolution
 */
export const fetchCreatureTimeline = async (userId: string): Promise<CreatureTimelinePoint[]> => {
  try {
    // This is a simplified approach - in a real implementation, you would need
    // to store snapshots of the creature state over time
    const { data: workoutData, error: workoutError } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', userId)
      .order('workout_date', { ascending: true });
    
    if (workoutError) throw workoutError;
    
    if (!workoutData || workoutData.length === 0) return [];
    
    // Create timeline points at key milestones
    // For this example, we'll create one point per month
    const timelinePoints: CreatureTimelinePoint[] = [];
    const monthsData: Record<string, WorkoutLog[]> = {};
    
    // Group workouts by month
    workoutData.forEach(log => {
      const date = new Date(log.workout_date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      if (!monthsData[monthKey]) {
        monthsData[monthKey] = [];
      }
      monthsData[monthKey].push(log);
    });
    
    // Calculate evolution for each month
    Object.entries(monthsData).forEach(([monthKey, logs], index) => {
      // Get a representative date for this month
      const firstLog = logs[0];
      const date = new Date(firstLog.workout_date).toISOString();
      
      // For each month, we'll simulate progress - in a real app,
      // you would want to calculate this based on actual performance metrics
      const simulatedLevel = Math.min(5, Math.ceil((index + 1) / 3)) as CreatureLevel;
      const type = determineCreatureType(logs);
      const aspects = calculateAspectScores(logs);
      
      timelinePoints.push({
        date,
        level: simulatedLevel,
        type,
        aspects
      });
    });
    
    return timelinePoints;
  } catch (error) {
    console.error("Error fetching creature timeline:", error);
    return [];
  }
};
