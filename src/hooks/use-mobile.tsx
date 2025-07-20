
import React, { useState, useEffect } from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    // Function to check if device is mobile
    const checkMobile = () => {
      // Check for mobile device using userAgent as a fallback
      const isMobileDevice = /iPhone|iPad|iPod|Android|webOS|BlackBerry|Windows Phone/i.test(
        navigator.userAgent
      )
      
      // Primary check using screen width
      const isMobileWidth = window.innerWidth < MOBILE_BREAKPOINT
      
      setIsMobile(isMobileWidth || isMobileDevice)
    }

    // Initial check
    checkMobile()

    // Add event listener for resize
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => checkMobile()
    mql.addEventListener("change", onChange)

    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
