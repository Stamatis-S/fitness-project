import { useState, useEffect, useCallback, useRef } from 'react';
import { getSoundEnabled } from './useHaptic';

interface RestTimerState {
  isRunning: boolean;
  timeRemaining: number;
  totalTime: number;
}

// Base64 encoded beep sound (louder, longer beep)
const BEEP_SOUND = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADhAC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAA4T/////////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//tQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tQZB8P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

export function useRestTimer(defaultDuration: number = 90) {
  const [state, setState] = useState<RestTimerState>({
    isRunning: false,
    timeRemaining: defaultDuration,
    totalTime: defaultDuration,
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isAudioUnlockedRef = useRef(false);

  // Pre-load audio on mount
  useEffect(() => {
    audioRef.current = new Audio(BEEP_SOUND);
    audioRef.current.volume = 1.0;
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Unlock audio on iOS - must be called from user interaction
  const unlockAudio = useCallback(async () => {
    if (isAudioUnlockedRef.current) return;
    
    try {
      // Method 1: Pre-loaded audio element
      if (audioRef.current) {
        await audioRef.current.play();
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    } catch (e) {
      // Silently fail - will try again on next interaction
    }
    
    try {
      // Method 2: AudioContext - create and resume
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      // Play silent sound to fully unlock
      const buffer = audioContextRef.current.createBuffer(1, 1, 22050);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.start(0);
      
      isAudioUnlockedRef.current = true;
    } catch (e) {
      console.log('Audio unlock failed:', e);
    }
  }, []);

  const playLoudBeep = useCallback(async () => {
    // Check if sound is enabled in settings
    if (!getSoundEnabled()) {
      return;
    }

    // Method 1: Use pre-loaded Audio element
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 1.0;
      try {
        await audioRef.current.play();
      } catch (e) {
        // Audio play failed
      }
    }

    // Method 2: Also try AudioContext for extra sound
    try {
      let ctx = audioContextRef.current;
      if (!ctx) {
        ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = ctx;
      }
      
      // Ensure context is resumed (required for iOS)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      
      const playBeep = (delay: number, frequency: number, duration: number) => {
        const oscillator = ctx!.createOscillator();
        const gainNode = ctx!.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx!.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'square';
        
        const startTime = ctx!.currentTime + delay;
        gainNode.gain.setValueAtTime(0.8, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };
      
      // Play 3 ascending beeps
      playBeep(0, 800, 0.2);
      playBeep(0.25, 1000, 0.2);
      playBeep(0.5, 1200, 0.3);
      
    } catch (e) {
      console.log('AudioContext failed:', e);
    }
  }, []);

  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) {
      // Success pattern: longer vibration for timer completion
      navigator.vibrate([200, 80, 200, 80, 200]);
    }
  }, []);

  const playAlert = useCallback(() => {
    playLoudBeep();
    triggerHaptic();
  }, [playLoudBeep, triggerHaptic]);

  const startTimer = useCallback((duration?: number) => {
    // Unlock audio when user starts timer (user interaction)
    unlockAudio();
    
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
  }, [defaultDuration, playAlert, unlockAudio]);

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
