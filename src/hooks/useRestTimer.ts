import { useState, useCallback, useRef, useEffect } from 'react';
import { triggerVibration } from '@/hooks/useHaptic';

interface RestTimerState {
  isRunning: boolean;
  timeRemaining: number;
  totalTime: number;
}

/**
 * Timestamp-based rest timer.
 *
 * Mobile browsers throttle (or fully suspend) `setInterval` when the tab is in
 * the background or the screen is locked. Instead of counting ticks we store the
 * absolute end timestamp and always derive the remaining time from `Date.now()`,
 * so the timer stays accurate after the app returns to the foreground.
 */
export function useRestTimer(defaultDuration: number = 90, onComplete?: () => void) {
  const [state, setState] = useState<RestTimerState>({
    isRunning: false,
    timeRemaining: defaultDuration,
    totalTime: defaultDuration,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Absolute timestamp (ms) when the running timer should reach zero.
  const endAtRef = useRef<number | null>(null);
  const totalTimeRef = useRef<number>(defaultDuration);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const clearTicker = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    // Completion pattern (respects the user's vibration setting).
    triggerVibration([200, 80, 200, 80, 200]);
    onCompleteRef.current?.();
  }, []);

  // Recomputes the remaining time from the stored end timestamp.
  const sync = useCallback(() => {
    if (endAtRef.current === null) return;
    const remaining = Math.max(0, Math.round((endAtRef.current - Date.now()) / 1000));

    setState({
      isRunning: remaining > 0,
      timeRemaining: remaining,
      totalTime: totalTimeRef.current,
    });

    if (remaining === 0) {
      clearTicker();
      endAtRef.current = null;
      handleComplete();
    }
  }, [clearTicker, handleComplete]);

  const startTicker = useCallback(() => {
    clearTicker();
    // 250ms keeps the display snappy while remaining cheap on mobile.
    intervalRef.current = setInterval(sync, 250);
  }, [clearTicker, sync]);

  // Re-sync when the app comes back to the foreground (background throttling).
  useEffect(() => {
    const resync = () => {
      if (document.visibilityState === 'visible') sync();
    };
    document.addEventListener('visibilitychange', resync);
    window.addEventListener('focus', resync);
    window.addEventListener('pageshow', resync);
    return () => {
      document.removeEventListener('visibilitychange', resync);
      window.removeEventListener('focus', resync);
      window.removeEventListener('pageshow', resync);
    };
  }, [sync]);

  // Cleanup on unmount
  useEffect(() => clearTicker, [clearTicker]);

  const startTimer = useCallback((duration?: number) => {
    // No duration => resume the remaining time (or restart from the default).
    const time = duration ?? (state.timeRemaining > 0 ? state.timeRemaining : defaultDuration);
    const total = duration ?? (state.timeRemaining > 0 ? state.totalTime : defaultDuration);

    completedRef.current = false;
    totalTimeRef.current = total;
    endAtRef.current = Date.now() + time * 1000;

    setState({ isRunning: true, timeRemaining: time, totalTime: total });
    startTicker();
  }, [defaultDuration, startTicker, state.timeRemaining, state.totalTime]);

  const stopTimer = useCallback(() => {
    clearTicker();
    const remaining = endAtRef.current !== null
      ? Math.max(0, Math.round((endAtRef.current - Date.now()) / 1000))
      : undefined;
    endAtRef.current = null;
    setState((prev) => ({
      ...prev,
      isRunning: false,
      timeRemaining: remaining ?? prev.timeRemaining,
    }));
  }, [clearTicker]);

  const resetTimer = useCallback(() => {
    clearTicker();
    endAtRef.current = null;
    completedRef.current = false;
    totalTimeRef.current = defaultDuration;
    setState({
      isRunning: false,
      timeRemaining: defaultDuration,
      totalTime: defaultDuration,
    });
  }, [clearTicker, defaultDuration]);

  const addTime = useCallback((seconds: number) => {
    if (endAtRef.current !== null) {
      endAtRef.current += seconds * 1000;
    }
    totalTimeRef.current = Math.max(1, totalTimeRef.current + seconds);
    setState((prev) => ({
      ...prev,
      timeRemaining: Math.max(0, prev.timeRemaining + seconds),
      totalTime: Math.max(1, prev.totalTime + seconds),
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
