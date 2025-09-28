"use client"

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react"
import { type Session } from "@supabase/supabase-js"
import { usePathname, useRouter } from "next/navigation"
import { supabaseBrowser } from "@/util/supabase/browser"
import { clientApi } from "@/trpc/react"
import { usePushNotifications } from "@/hooks/use-push-notifications"
import { useIsNative } from "@/hooks/use-platform"
import { useDeepLinks } from "@/hooks/use-deep-links"
import { Browser } from "@capacitor/browser"
import { Loader2Icon } from "lucide-react"

type AuthContextValue = {
  session: Session | null
  loading: boolean
  userData: any
  userDataLoading: boolean
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>
  signInWithGoogle: () => Promise<{ error?: string }>
  signOut: () => Promise<void>
  getAccessToken: () => string | null
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const isNative = useIsNative()
  const supabase = useMemo(() => supabaseBrowser(), [])
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const { initialize: initializePushNotifications } = usePushNotifications()
  
  useDeepLinks()

  const {
    data: userData,
    isLoading: userDataLoading,
  } = clientApi.user.me.useQuery(undefined, {
    enabled: !!session?.user,
    staleTime: 5 * 60 * 1000,
  })

  const handleOnboarding = useCallback(
    () => {
      if (!userData || userDataLoading) return
      // Handle onboarding flow and redirects
      if (!userData.hasCompletedOnboarding) {
        // User needs basic onboarding - only allow /onboarding path
        if (!pathname.startsWith("/onboarding")) {
          router.push("/onboarding")
        }
      } else {
        if (pathname === "/onboarding") {
          // Redirect away from basic onboarding if already completed
          router.push("/dashboard")
        } else if (pathname === "/onboarding/role") {
          // Only allow role selection if user has no roles
          if (userData.isHelper || userData.isSeeker) {
            router.push("/dashboard")
          }
        } else if (pathname === "/onboarding/helper") {
          // Only allow helper onboarding if user doesn't have helper profile
          if (userData.isHelper && userData.helperProfile) {
            router.push("/dashboard")
          }
        } else if (pathname === "/onboarding/seeker") {
          // Only allow seeker onboarding if user doesn't have seeker profile
          if (userData.isSeeker && userData.seekerProfile) {
            router.push("/dashboard")
          }
        } else if (pathname === "/dashboard") {
          // Handle dashboard redirects for users with no roles
          if (!userData.isHelper && !userData.isSeeker) {
            router.push("/onboarding/role")
          }
        }
      }
    },
    [userDataLoading, userData, pathname]
  )

  useEffect(() => {
    let isMounted = true

    const init = async () => {
      setLoading(true)
      const { data } = await supabase.auth.getSession()
      if (isMounted) {
        setSession(data.session)
        setLoading(false)
      }
    }
    init()

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession)
        if (event === "SIGNED_OUT") {
          router.push("/login")
        } else if (
          event === "TOKEN_REFRESHED" ||
          event === "SIGNED_IN" ||
          event === "USER_UPDATED"
        ) {
          if (currentSession?.user && userData) {
            handleOnboarding()
          }
        }
      }
    )

    return () => {
      isMounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      userData,
      userDataLoading,
      signInWithEmail: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) return { error: error.message }
        return {}
      },
      signInWithGoogle: async () => {
        if (isNative) {
          try {            
            const redirectUrl = `com.wingapp.app://auth/callback`            
            const { data, error } = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: redirectUrl,
                skipBrowserRedirect: true
              }
            })
            
            if (error) {
              console.error('OAuth URL generation error:', error)
              return { error: error.message }
            }
            
            if (data?.url) {
              await Browser.open({ 
                url: data.url,
                windowName: '_self'
              })

              return {}
            }

            return { error: 'Failed to get OAuth URL' }
          } catch (error) {
            console.error('OAuth error:', error)
            return { error: 'Failed to initiate OAuth flow' }
          }
        } else {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`
            }
          })
          if (error) return { error: error.message }
          return {}
        }
      },
      signOut: async () => {
        await supabase.auth.signOut()
      },
      getAccessToken: () => session?.access_token ?? null,
    }),
    [session, loading, userData, userDataLoading, isNative]
  )

  useEffect(() => {
    if (userData) {
      initializePushNotifications();
    }
  }, [userData]);

  useEffect(() => {
    handleOnboarding();
  }, [handleOnboarding]);

  if (loading || userDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
            <div className="absolute inset-0 h-8 w-8 animate-ping rounded-full bg-primary/20"></div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Initializing...</p>
            <p className="text-xs text-muted-foreground">Setting up your session</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
