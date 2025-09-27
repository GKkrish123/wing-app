import { useEffect, useState } from 'react'
import { App } from '@capacitor/app'

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

  useEffect(() => {
    if (platform === 'web') return;

    let listener: any;
    const setupListeners = async () => {
      listener = await App.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else {
          App.minimizeApp();
        }
      });
    }
    setupListeners();

    return () => {
      if (listener) {
        listener.remove();
      }
    }
  }, [platform]);

  return platform
}

export function useIsNative(): boolean {
  const platform = usePlatform()
  return platform === 'ios' || platform === 'android'
}
