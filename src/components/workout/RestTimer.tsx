import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Timer, Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react';
import { useRestTimer } from '@/hooks/useRestTimer';
import { useHaptic } from '@/hooks/useHaptic';

interface RestTimerProps {
  defaultDuration?: number;
  onTimerComplete?: () => void;
}

export function RestTimer({ defaultDuration = 90, onTimerComplete }: RestTimerProps) {
  const { isRunning, timeRemaining, totalTime, startTimer, stopTimer, resetTimer, addTime } = useRestTimer(defaultDuration);
  const { vibrate } = useHaptic();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = totalTime > 0 ? (timeRemaining / totalTime) * 100 : 100;

  const presetTimes = [60, 90, 120, 180];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-ios-surface-elevated rounded-ios-lg p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Timer className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Rest Timer</span>
      </div>

      {/* Timer Display */}
      <div className="relative flex items-center justify-center mb-4">
        <div className="relative w-28 h-28">
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="50"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="6"
            />
            {/* Progress circle */}
            <circle
              cx="56"
              cy="56"
              r="50"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          {/* Time display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-foreground">{formatTime(timeRemaining)}</span>
          </div>
        </div>
      </div>

      {/* Preset Time Buttons */}
      <div className="flex gap-2 mb-4 justify-center">
        {presetTimes.map((time) => (
          <Button
            key={time}
            type="button"
            variant="outline"
            size="sm"
            className="text-xs px-3 h-8 rounded-full"
            onClick={() => {
              vibrate('light');
              startTimer(time);
            }}
          >
            {time}s
          </Button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-11 w-11 rounded-full"
          onClick={() => {
            vibrate('light');
            addTime(-15);
          }}
          disabled={timeRemaining <= 15}
        >
          <Minus className="h-4 w-4" />
        </Button>

        <AnimatePresence mode="wait">
          {isRunning ? (
            <motion.div
              key="pause"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <Button
                type="button"
                size="icon"
                className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90"
                onClick={() => {
                  vibrate('light');
                  stopTimer();
                }}
              >
                <Pause className="h-6 w-6" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="play"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <Button
                type="button"
                size="icon"
                className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90"
                onClick={() => {
                  vibrate('light');
                  startTimer();
                }}
              >
                <Play className="h-6 w-6 ml-0.5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-11 w-11 rounded-full"
          onClick={() => {
            vibrate('light');
            addTime(15);
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Reset button */}
      <div className="flex justify-center mt-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => {
            vibrate('light');
            resetTimer();
          }}
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          Reset
        </Button>
      </div>
    </motion.div>
  );
}
