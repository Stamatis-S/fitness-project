import { useState, useEffect, useCallback } from 'react';

export function useWakeLock() {
  const [isLocked, setIsLocked] = useState(false);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

  const requestWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator) {
      try {
        const lock = await navigator.wakeLock.request('screen');
        setWakeLock(lock);
        setIsLocked(true);

        lock.addEventListener('release', () => {
          setIsLocked(false);
          setWakeLock(null);
        });

        return true;
      } catch (err) {
        console.log('Wake Lock request failed:', err);
        return false;
      }
    }
    return false;
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLock) {
      await wakeLock.release();
      setWakeLock(null);
      setIsLocked(false);
    }
  }, [wakeLock]);

  // Re-acquire wake lock when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isLocked && !wakeLock) {
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLocked, wakeLock, requestWakeLock]);

  return {
    isLocked,
    requestWakeLock,
    releaseWakeLock,
    isSupported: 'wakeLock' in navigator,
  };
}
