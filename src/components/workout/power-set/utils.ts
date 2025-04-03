
// This utility initializes a pair of power set exercises with their respective sets
export const initializePowerSetPair = (
  exercise1Sets: any[],
  exercise2Sets: any[],
  regularSets: any[],
  appendExercise1: (data: { weight: number, reps: number }) => void,
  appendExercise2: (data: { weight: number, reps: number }) => void
) => {
  // If no sets exist for the first exercise, initialize with a default set
  if (exercise1Sets.length === 0) {
    appendExercise1({ weight: 0, reps: 0 });
  }
  
  // If no sets exist for the second exercise, initialize with a default set
  if (exercise2Sets.length === 0) {
    appendExercise2({ weight: 0, reps: 0 });
  }
};
