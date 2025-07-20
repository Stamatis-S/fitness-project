
const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Simplified implementation without React hooks to avoid bundling issues
  if (typeof window === 'undefined') return false;
  
  // Check for mobile device using userAgent as a fallback
  const isMobileDevice = /iPhone|iPad|iPod|Android|webOS|BlackBerry|Windows Phone/i.test(
    navigator.userAgent
  );
  
  // Primary check using screen width
  const isMobileWidth = window.innerWidth < MOBILE_BREAKPOINT;
  
  return isMobileWidth || isMobileDevice;
}
