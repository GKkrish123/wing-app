"use client"

import { useEffect } from 'react'
import { App } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/util/supabase/browser'
import { useIsNative } from './use-platform'

export function useDeepLinks() {
  const router = useRouter()
  const isNative = useIsNative()
  const supabase = supabaseBrowser()

  useEffect(() => {
    if (!isNative) return

    let appUrlOpenListener: any

    const handleAuthCallback = async (url: string) => {
      try {
        const urlObj = new URL(url)
        const authCode = urlObj.searchParams.get('code')
        const error = urlObj.searchParams.get('error')
        
        if (error) {
          console.error('OAuth error:', error)
          router.replace('/auth/auth-code-error')
          return
        }
        
        if (authCode) {
          console.log('Auth code received, processing...')
          
          const { error } = await supabase.auth.exchangeCodeForSession(authCode)
          try {
            await Browser.close()
          } catch (e) {
            console.log('Browser close error (expected):', e)
          }
          if (error) {
            console.error('Exchange code for session error:', error)
            router.replace('/auth/auth-code-error')
          } else {
            console.log('Authentication successful!')
            router.replace('/dashboard')
          }
        } else {
          console.error('No auth code in callback URL')
          router.replace('/auth/auth-code-error')
        }
      } catch (error) {
        console.error('Deep link handling error:', error)
        router.replace('/auth/auth-code-error')
      }
    }

    const setupDeepLinkListener = async () => {
      // Handle deep link when app is already open
      appUrlOpenListener = await App.addListener('appUrlOpen', async (event) => {
        const url = event.url
        if (url.includes('auth/callback') || url.includes('localhost:3000')) {
          await handleAuthCallback(url)
        }
      })

      // Handle deep link when app is launched from closed state
      const appState = await App.getState()
      if (appState.isActive) {
        const launchUrl = await App.getLaunchUrl()
        if (launchUrl?.url && (launchUrl.url.includes('auth/callback') || launchUrl.url.includes('localhost:3000'))) {
          await handleAuthCallback(launchUrl.url)
        }
      }
    }

    setupDeepLinkListener()

    return () => {
      if (appUrlOpenListener) {
        appUrlOpenListener.remove()
      }
    }
  }, [isNative])
}
