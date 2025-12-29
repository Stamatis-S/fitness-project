import { useCallback } from 'react';

type HapticType = 'light' | 'success' | 'error';

const HAPTIC_PATTERNS: Record<HapticType, number | number[]> = {
  light: 10,
  success: [10, 50, 20],
  error: [50, 30, 50, 30, 50],
};

export const useHaptic = () => {
  const vibrate = useCallback((type: HapticType = 'light') => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(HAPTIC_PATTERNS[type]);
    }
  }, []);

  return { vibrate };
};
