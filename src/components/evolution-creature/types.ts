
export type CreatureType = 
  | "Swift Runner" 
  | "Mighty Lifter" 
  | "Grounded Powerhouse" 
  | "Flexible Master" 
  | "Balanced Athlete";

export type FitnessAspect = "strength" | "endurance" | "flexibility" | "balance";

export type CreatureLevel = 1 | 2 | 3 | 4 | 5;

export interface CreatureData {
  type: CreatureType;
  level: CreatureLevel;
  aspects: Record<FitnessAspect, number>; // Values from 0-100
  lastEvolution?: string; // Date string
}

export interface CreatureTimelinePoint {
  date: string;
  level: CreatureLevel;
  type: CreatureType;
  aspects: Record<FitnessAspect, number>;
}
