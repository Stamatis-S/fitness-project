
import { UseFieldArrayAppend } from "react-hook-form";
import { SetData } from "@/components/workout/types";

export function initializePowerSetPair(
  exercise1Sets: SetData[],
  exercise2Sets: SetData[],
  regularSets: SetData[],
  appendExercise1: UseFieldArrayAppend<any, "exercise1Sets">,
  appendExercise2: UseFieldArrayAppend<any, "exercise2Sets">
) {
  // Initialize exercise-specific sets if they don't exist yet
  if ((exercise1Sets.length === 0 || exercise2Sets.length === 0) && regularSets.length > 0) {
    // Copy sets from the common sets array to the exercise-specific arrays
    if (exercise1Sets.length === 0) {
      regularSets.forEach(set => {
        appendExercise1({ weight: set.weight, reps: set.reps });
      });
    }
    
    if (exercise2Sets.length === 0) {
      regularSets.forEach(set => {
        appendExercise2({ weight: set.weight, reps: set.reps });
      });
    }
  } else if (exercise1Sets.length === 0 && exercise2Sets.length === 0) {
    // If both arrays are empty, initialize with one default set
    appendExercise1({ weight: 0, reps: 0 });
    appendExercise2({ weight: 0, reps: 0 });
  }
}
