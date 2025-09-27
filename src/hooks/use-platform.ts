import { useEffect, useState } from 'react'

export type Platform = 'web' | 'ios' | 'android' | 'unknown'

export function usePlatform(): Platform {
  const [platform, setPlatform] = useState<Platform>('unknown')

  useEffect(() => {
    const detectPlatform = () => {
      // Check if running in Capacitor
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        const capacitor = (window as any).Capacitor
        if (capacitor.getPlatform() === 'ios') {
          return 'ios'
        } else if (capacitor.getPlatform() === 'android') {
          return 'android'
        }
      }

      // Check user agent for mobile browsers
      if (typeof window !== 'undefined') {
        const userAgent = window.navigator.userAgent.toLowerCase()
        if (/iphone|ipad|ipod/.test(userAgent)) {
          return 'ios'
        } else if (/android/.test(userAgent)) {
          return 'android'
        }
      }

      return 'web'
    }

    setPlatform(detectPlatform())
  }, [])

  return platform
}

export function useIsMobile(): boolean {
  const platform = usePlatform()
  return platform === 'ios' || platform === 'android'
}

export function useIsNative(): boolean {
  const platform = usePlatform()
  return platform === 'ios' || platform === 'android'
}
