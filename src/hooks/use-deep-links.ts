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
        console.log('Handling auth callback URL:', url)
        
        // Parse the URL
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
          
          // Close the browser window
          try {
            await Browser.close()
          } catch (e) {
            console.log('Browser close error (expected):', e)
          }
          
          // For Capacitor, we need to trigger the auth state change
          // The PKCE code verifier should be stored automatically by Supabase
          await new Promise(resolve => setTimeout(resolve, 1000)) // Small delay to let Supabase process
          
          // Check if session is now available
          const { data, error: sessionError } = await supabase.auth.getSession()
          
          if (!sessionError && data.session) {
            console.log('Authentication successful!')
            router.replace('/dashboard')
          } else {
            console.error('Session error:', sessionError)
            router.replace('/auth/auth-code-error')
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
        console.log('App URL opened:', url)
        
        // Check if this is an auth callback
        if (url.includes('auth/callback') || url.includes('localhost:3000')) {
          await handleAuthCallback(url)
        }
      })

      // Handle deep link when app is launched from closed state
      const appState = await App.getState()
      if (appState.isActive) {
        const launchUrl = await App.getLaunchUrl()
        if (launchUrl?.url && (launchUrl.url.includes('auth/callback') || launchUrl.url.includes('localhost:3000'))) {
          console.log('Launch URL contains auth callback:', launchUrl.url)
          await handleAuthCallback(launchUrl.url)
        }
      }

      // Also listen for URL changes in the browser window (for development)
      if (typeof window !== 'undefined') {
        const checkForAuthCode = () => {
          const currentUrl = window.location.href
          if (currentUrl.includes('code=') && currentUrl.includes('auth/callback')) {
            console.log('Detected auth callback in browser URL:', currentUrl)
            handleAuthCallback(currentUrl)
          }
        }

        // Check immediately
        checkForAuthCode()

        // Also check periodically while the browser is open
        const intervalId = setInterval(checkForAuthCode, 1000)
        
        // Clean up interval after 30 seconds
        setTimeout(() => clearInterval(intervalId), 30000)
      }
    }

    setupDeepLinkListener()

    return () => {
      if (appUrlOpenListener) {
        appUrlOpenListener.remove()
      }
    }
  }, [isNative, router, supabase])
}
