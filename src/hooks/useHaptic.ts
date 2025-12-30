import { useCallback, useEffect } from 'react';

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

// Audio context singleton
let audioContext: AudioContext | null = null;
let isAudioUnlocked = false;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  
  if (!audioContext) {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContext = new AudioContextClass();
      }
    } catch (e) {
      console.log('AudioContext not supported:', e);
      return null;
    }
  }
  return audioContext;
};

// Unlock audio on first user interaction (required for iOS/mobile)
const unlockAudio = async () => {
  if (isAudioUnlocked) return;
  
  const ctx = getAudioContext();
  if (!ctx) return;
  
  try {
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    
    // Play a silent sound to unlock audio on iOS
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    
    isAudioUnlocked = true;
  } catch (e) {
    console.log('Audio unlock failed:', e);
  }
};

// Initialize audio unlock listeners
if (typeof window !== 'undefined') {
  const events = ['touchstart', 'touchend', 'click', 'keydown'];
  const unlockHandler = () => {
    unlockAudio();
    // Remove listeners after first interaction
    events.forEach(event => {
      document.removeEventListener(event, unlockHandler, true);
    });
  };
  events.forEach(event => {
    document.addEventListener(event, unlockHandler, true);
  });
}

const playTone = async (frequency: number, duration: number, volume: number = 0.3) => {
  // Always check current state
  const enabled = getStoredSoundEnabled();
  
  if (!enabled) {
    return;
  }
  
  try {
    const ctx = getAudioContext();
    if (!ctx) {
      return;
    }
    
    // Ensure audio is resumed - critical for iOS
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    
    // Wait a tiny bit after resume for iOS to be ready
    if (ctx.state !== 'running') {
      await new Promise(resolve => setTimeout(resolve, 50));
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
  // Unlock audio when hook is used
  useEffect(() => {
    unlockAudio();
  }, []);

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
  if (soundEnabled) {
    SOUND_PATTERNS[type]();
  }
};
