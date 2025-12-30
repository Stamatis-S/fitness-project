import { useState, useCallback, useRef, useEffect } from 'react';

interface RestTimerState {
  isRunning: boolean;
  timeRemaining: number;
  totalTime: number;
}

export function useRestTimer(defaultDuration: number = 90) {
  const [state, setState] = useState<RestTimerState>({
    isRunning: false,
    timeRemaining: defaultDuration,
    totalTime: defaultDuration,
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) {
      // Success pattern: longer vibration for timer completion
      navigator.vibrate([200, 80, 200, 80, 200]);
    }
  }, []);

  const startTimer = useCallback((duration?: number) => {
    const time = duration || defaultDuration;
    setState({
      isRunning: true,
      timeRemaining: time,
      totalTime: time,
    });

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.timeRemaining <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          triggerHaptic();
          return { ...prev, isRunning: false, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
  }, [defaultDuration, triggerHaptic]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setState((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setState({
      isRunning: false,
      timeRemaining: defaultDuration,
      totalTime: defaultDuration,
    });
  }, [defaultDuration]);

  const addTime = useCallback((seconds: number) => {
    setState((prev) => ({
      ...prev,
      timeRemaining: prev.timeRemaining + seconds,
      totalTime: prev.totalTime + seconds,
    }));
  }, []);

  return {
    ...state,
    startTimer,
    stopTimer,
    resetTimer,
    addTime,
  };
}
