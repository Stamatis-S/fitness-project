import { useCallback, useRef, useEffect } from 'react';

type FeedbackType = 'light' | 'success' | 'error';

// Audio context singleton
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

const playTone = (frequency: number, duration: number, volume: number = 0.3) => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    const startTime = ctx.currentTime;
    gainNode.gain.setValueAtTime(volume, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  } catch (e) {
    console.log('Audio playback failed:', e);
  }
};

const SOUND_PATTERNS: Record<FeedbackType, () => void> = {
  light: () => {
    playTone(800, 0.08, 0.15);
  },
  success: () => {
    playTone(523, 0.12, 0.25); // C5
    setTimeout(() => playTone(659, 0.12, 0.25), 100); // E5
    setTimeout(() => playTone(784, 0.15, 0.25), 200); // G5
  },
  error: () => {
    playTone(200, 0.15, 0.3);
    setTimeout(() => playTone(180, 0.2, 0.3), 150);
  },
};

export const useHaptic = () => {
  const vibrate = useCallback((type: FeedbackType = 'light') => {
    SOUND_PATTERNS[type]();
  }, []);

  return { vibrate };
};

// Helper for non-React contexts
export const playFeedback = (type: FeedbackType) => {
  SOUND_PATTERNS[type]();
};
