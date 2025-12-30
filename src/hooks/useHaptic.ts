import { useCallback } from 'react';

type FeedbackType = 'light' | 'success' | 'error';

const SOUND_ENABLED_KEY = 'sound-feedback-enabled';

// Get sound enabled state from localStorage (defaults to true)
const getStoredSoundEnabled = (): boolean => {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(SOUND_ENABLED_KEY);
  // Default to true if not set
  if (stored === null) return true;
  return stored === 'true';
};

// Sound enabled state - always check localStorage
let soundEnabled = getStoredSoundEnabled();

export const getSoundEnabled = (): boolean => {
  // Re-read from localStorage to ensure sync
  soundEnabled = getStoredSoundEnabled();
  return soundEnabled;
};

export const setSoundEnabled = (enabled: boolean) => {
  soundEnabled = enabled;
  if (typeof window !== 'undefined') {
    localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
  }
};

// Audio context - recreated when needed
let audioContext: AudioContext | null = null;

const createFreshAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  
  // Close old context if exists
  if (audioContext) {
    try {
      audioContext.close();
    } catch (e) {
      // Ignore close errors
    }
    audioContext = null;
  }
  
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioContext = new AudioContextClass();
      return audioContext;
    }
  } catch (e) {
    return null;
  }
  return null;
};

const getOrCreateAudioContext = async (): Promise<AudioContext | null> => {
  if (typeof window === 'undefined') return null;
  
  // If no context exists, create one
  if (!audioContext) {
    return createFreshAudioContext();
  }
  
  // If context is closed, create new one
  if (audioContext.state === 'closed') {
    return createFreshAudioContext();
  }
  
  // Try to resume if suspended
  if (audioContext.state === 'suspended') {
    try {
      await audioContext.resume();
      
      // Wait a bit for iOS
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // If still suspended after resume attempt, context is dead - recreate
      if (audioContext.state === 'suspended') {
        return createFreshAudioContext();
      }
    } catch (e) {
      return createFreshAudioContext();
    }
  }
  
  return audioContext;
};

// Force wake and get working audio context
const getWorkingAudioContext = async (): Promise<AudioContext | null> => {
  const ctx = await getOrCreateAudioContext();
  if (!ctx) return null;
  
  try {
    // Always try to resume
    if (ctx.state !== 'running') {
      await ctx.resume();
    }
    
    // Play silent buffer to unlock on iOS
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    
    // Wait for iOS to actually wake up
    await new Promise(resolve => setTimeout(resolve, 30));
    
    // Final resume attempt
    if (ctx.state !== 'running') {
      await ctx.resume();
    }
    
    return ctx.state === 'running' ? ctx : null;
  } catch (e) {
    return null;
  }
};

const playTone = async (frequency: number, duration: number, volume: number = 0.3) => {
  // Always check current state
  const enabled = getStoredSoundEnabled();
  
  if (!enabled) {
    return;
  }
  
  try {
    const ctx = await getWorkingAudioContext();
    if (!ctx || ctx.state !== 'running') {
      return;
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
    // Silent fail - audio not supported
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
    // Always check current state from localStorage
    const enabled = getStoredSoundEnabled();
    if (enabled) {
      SOUND_PATTERNS[type]();
    }
  }, []);

  return { vibrate };
};

// Helper for non-React contexts
export const playFeedback = (type: FeedbackType) => {
  const enabled = getStoredSoundEnabled();
  if (enabled) {
    SOUND_PATTERNS[type]();
  }
};
