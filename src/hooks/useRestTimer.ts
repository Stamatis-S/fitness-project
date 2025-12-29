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

  // Initialize audio context for louder sound
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const playLoudBeep = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create 3 sequential beeps for attention
      const playBeep = (startTime: number, frequency: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'square';
        
        // Maximum volume
        gainNode.gain.setValueAtTime(1, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);
      };
      
      // Play 3 loud beeps
      playBeep(audioContext.currentTime, 880);
      playBeep(audioContext.currentTime + 0.35, 988);
      playBeep(audioContext.currentTime + 0.7, 1047);
      
    } catch (e) {
      console.log('Audio not supported');
    }
  }, []);

  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  }, []);

  const playAlert = useCallback(() => {
    playLoudBeep();
    triggerHaptic();
  }, [playLoudBeep, triggerHaptic]);

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
