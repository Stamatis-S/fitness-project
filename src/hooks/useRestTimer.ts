import { useState, useEffect, useCallback, useRef } from 'react';

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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleWE3Nni/0NKFRi0wdLLT1JJYMDNzrs3OhlAwNnm0ys2CUzU3e7TIy4JYNjl8tMjKgls3O320x8mBXTg9fbTGyIF+');
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  }, []);

  const playAlert = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
    triggerHaptic();
  }, [triggerHaptic]);

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
          playAlert();
          return { ...prev, isRunning: false, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
  }, [defaultDuration, playAlert]);

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
