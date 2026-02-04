import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import type { WorkoutLog } from "@/components/saved-exercises/types";
import { CustomTooltip } from "./CustomTooltip";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = [
  "#8b5cf6", // violet
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#3b82f6", // blue
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

interface ProgressTrackingProps {
  workoutLogs: WorkoutLog[];
}

export function ProgressTracking({ workoutLogs }: ProgressTrackingProps) {
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { session } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (!session) {
    navigate('/auth');
    return null;
  }

  if (!Array.isArray(workoutLogs)) {
    console.error('Invalid workoutLogs:', workoutLogs);
    return <Card className="p-4">Loading...</Card>;
  }

  const exerciseNames = useMemo(() => {
    try {
      const names = new Set<string>();
      workoutLogs.forEach(log => {
        if (!log) return;
        const name = log.custom_exercise || (log.exercises && log.exercises.name);
        if (name) names.add(name);
      });
      return Array.from(names).sort();
    } catch (error) {
      console.error('Error processing exercise names:', error);
      return [];
    }
  }, [workoutLogs]);

  const filteredExercises = useMemo(() => {
    return searchTerm 
      ? exerciseNames.filter(name => 
          name.toLowerCase().includes(searchTerm.toLowerCase()))
      : exerciseNames;
  }, [exerciseNames, searchTerm]);

  const progressData = useMemo(() => {
    try {
      const dataMap = new Map<string, Map<string, { totalWeight: number; totalReps: number }>>();
      
      const sortedLogs = [...workoutLogs]
        .filter(log => log && log.workout_date && log.weight_kg && log.reps)
        .sort((a, b) => {
          const dateA = new Date(a.workout_date).getTime();
          const dateB = new Date(b.workout_date).getTime();
          return dateA - dateB;
        });

      sortedLogs.forEach(log => {
        if (!log.workout_date || !log.weight_kg || !log.reps) return;
        
        const date = log.workout_date;
        const exercise = log.custom_exercise || (log.exercises && log.exercises.name);
        
        if (!exercise) return;
        
        if (!dataMap.has(date)) {
          dataMap.set(date, new Map());
        }
        
        const exerciseMap = dataMap.get(date)!;
        if (!exerciseMap.has(exercise)) {
          exerciseMap.set(exercise, { totalWeight: 0, totalReps: 0 });
        }
        
        const current = exerciseMap.get(exercise)!;
        current.totalWeight += log.weight_kg * log.reps;
        current.totalReps += log.reps;
      });

      return Array.from(dataMap.entries())
        .map(([date, exerciseMap]) => {
          try {
            const dataPoint: Record<string, any> = {
              date: format(parseISO(date), isMobile ? 'dd/MM' : 'MMM d'),
              rawDate: date,
            };
            
            selectedExercises.forEach(exercise => {
              const exerciseData = exerciseMap.get(exercise);
              if (exerciseData && exerciseData.totalReps > 0) {
                dataPoint[exercise] = Number((exerciseData.totalWeight / exerciseData.totalReps).toFixed(1));
              } else {
                dataPoint[exercise] = null;
              }
            });
            
            return dataPoint;
          } catch (error) {
            console.error('Error processing data point:', error);
            return null;
          }
        })
        .filter(Boolean)
        .sort((a, b) => new Date(a!.rawDate).getTime() - new Date(b!.rawDate).getTime());
    } catch (error) {
      console.error('Error processing progress data:', error);
      return [];
    }
  }, [workoutLogs, selectedExercises, isMobile]);

  const toggleExercise = (name: string) => {
    setSelectedExercises(prev =>
      prev.includes(name)
        ? prev.filter(e => e !== name)
        : [...prev, name]
    );
  };

  const removeExercise = (name: string) => {
    setSelectedExercises(prev => prev.filter(e => e !== name));
  };

  const getTickInterval = () => {
    if (progressData.length <= 6) return 0;
    if (progressData.length <= 12) return 1;
    return Math.floor(progressData.length / 6);
  };

  return (
    <div className="space-y-3">
      {/* Search & Exercise Selector */}
      <Card className="p-3 bg-card/50 backdrop-blur border-border/50">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Αναζήτηση άσκησης..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 bg-background/50 border-border/50"
          />
        </div>
        
        {/* Exercise Pills */}
        <div 
          className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto pb-1"
          style={{ scrollbarWidth: 'thin' }}
        >
          {filteredExercises.length === 0 ? (
            <p className="text-muted-foreground text-sm p-2">Δεν βρέθηκαν ασκήσεις</p>
          ) : (
            filteredExercises.map(name => {
              const isSelected = selectedExercises.includes(name);
              const colorIndex = selectedExercises.indexOf(name);
              return (
                <motion.button
                  key={name}
                  onClick={() => toggleExercise(name)}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    px-2.5 py-1.5 rounded-full text-xs font-medium transition-all
                    ${isSelected 
                      ? 'text-white shadow-md' 
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }
                  `}
                  style={isSelected ? { 
                    backgroundColor: COLORS[colorIndex % COLORS.length],
                  } : undefined}
                >
                  {name.length > 18 ? name.substring(0, 18) + '…' : name}
                </motion.button>
              );
            })
          )}
        </div>
      </Card>

      {/* Selected Exercises - Quick Remove */}
      <AnimatePresence>
        {selectedExercises.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {selectedExercises.map((exercise, index) => (
              <motion.span
                key={exercise}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              >
                <span className="max-w-[100px] truncate">{exercise}</span>
                <button 
                  onClick={() => removeExercise(exercise)}
                  className="p-0.5 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chart */}
      <Card className="p-3 bg-card/50 backdrop-blur border-border/50">
        <div className={`${isMobile ? 'h-[260px]' : 'h-[350px]'}`}>
          {progressData.length > 0 && selectedExercises.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={progressData}
                margin={isMobile 
                  ? { top: 10, right: 10, left: -10, bottom: 5 }
                  : { top: 15, right: 20, left: 0, bottom: 5 }
                }
              >
                <defs>
                  {selectedExercises.map((_, index) => (
                    <linearGradient 
                      key={`gradient-${index}`} 
                      id={`lineGradient-${index}`} 
                      x1="0" y1="0" x2="1" y2="0"
                    >
                      <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.8} />
                      <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={1} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  opacity={0.3}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: isMobile ? 10 : 11, fill: "hsl(var(--muted-foreground))" }}
                  stroke="hsl(var(--border))"
                  interval={getTickInterval()}
                  tickMargin={8}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: isMobile ? 10 : 11, fill: "hsl(var(--muted-foreground))" }}
                  stroke="hsl(var(--border))"
                  domain={['auto', 'auto']}
                  width={isMobile ? 40 : 50}
                  tickFormatter={(val) => `${val}kg`}
                  axisLine={false}
                />
                <RechartsTooltip 
                  content={<CustomTooltip />}
                  cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                {selectedExercises.map((exercise, index) => (
                  <Line
                    key={exercise}
                    type="monotone"
                    dataKey={exercise}
                    stroke={COLORS[index % COLORS.length]}
                    dot={{ 
                      r: isMobile ? 3 : 4, 
                      strokeWidth: 2,
                      fill: 'hsl(var(--background))',
                      stroke: COLORS[index % COLORS.length]
                    }}
                    activeDot={{ 
                      r: isMobile ? 5 : 7, 
                      strokeWidth: 2,
                      fill: COLORS[index % COLORS.length],
                      stroke: 'hsl(var(--background))'
                    }}
                    connectNulls
                    strokeWidth={isMobile ? 2 : 2.5}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  {selectedExercises.length === 0 
                    ? "Επίλεξε ασκήσεις για να δεις την πρόοδό σου"
                    : "Δεν υπάρχουν δεδομένα"}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Πάτα πάνω σε μια άσκηση για να την προσθέσεις
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
