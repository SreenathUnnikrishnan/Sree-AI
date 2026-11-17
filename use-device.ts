import { useState, useEffect } from 'react'

interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  orientation: 'portrait' | 'landscape'
  touchSupported: boolean
}

export function useDevice(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenSize: 'lg',
        orientation: 'landscape',
        touchSupported: false,
      }
    }
    
    return getDeviceInfo()
  })

  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo(getDeviceInfo())
    }

    const handleOrientationChange = () => {
      // Small delay to ensure dimensions are updated after orientation change
      setTimeout(() => {
        setDeviceInfo(getDeviceInfo())
      }, 100)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  return deviceInfo
}

function getDeviceInfo(): DeviceInfo {
  const width = window.innerWidth
  const height = window.innerHeight
  const touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  // Determine screen size
  let screenSize: DeviceInfo['screenSize']
  if (width < 640) screenSize = 'xs'
  else if (width < 768) screenSize = 'sm'
  else if (width < 1024) screenSize = 'md'
  else if (width < 1280) screenSize = 'lg'
  else if (width < 1536) screenSize = 'xl'
  else screenSize = '2xl'

  // Determine device type
  const isMobile = width < 768
  const isTablet = width >= 768 && width < 1024
  const isDesktop = width >= 1024

  // Determine orientation
  const orientation = width > height ? 'landscape' : 'portrait'

  return {
    isMobile,
    isTablet,
    isDesktop,
    screenSize,
    orientation,
    touchSupported,
  }
}

export type { DeviceInfo }