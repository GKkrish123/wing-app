"use client"

import { useState, useEffect, useCallback } from "react"
import { type RealtimeChannel } from "@supabase/supabase-js"
import { supabaseBrowser } from "@/util/supabase/browser"
import { clientApi } from "@/trpc/react"
import { toast } from "sonner"
import { useAuth } from "@/components/providers/auth-provider"
import { Geolocation } from "@capacitor/geolocation"
import { useIsNative } from "./use-platform"

interface LocationState {
  latitude?: number
  longitude?: number
  accuracy: number | null
  isEnabled: boolean
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
  isLiveLocation: boolean
}

interface UseRealtimeLocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  updateInterval?: number // in milliseconds
  autoUpdate?: boolean
}

interface NearbyUser {
  id: string
  name: string
  profilePicture: string | null
  latitude: number
  longitude: number
  isHelper: boolean
  isSeeker: boolean
  updatedAt: Date
}

export function useRealtimeLocation(options: UseRealtimeLocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 10000,
    updateInterval = 30000, // 30 seconds - real-time tracking
    autoUpdate = true,
  } = options

  const isNative = useIsNative()

  const [location, setLocation] = useState<LocationState>({
    latitude: undefined,
    longitude: undefined,
    accuracy: null,
    isEnabled: false,
    isLoading: false,
    error: null,
    lastUpdated: null,
    isLiveLocation: false,
  })
  const { userData } = useAuth()

  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([])
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const [isPageVisible, setIsPageVisible] = useState(true)

  const supabase = supabaseBrowser()
  const { mutateAsync } = clientApi.user.updateLocation.useMutation()
  
  // Get nearby users when location changes
  const { data: nearbyUsersData, refetch: refetchNearbyUsers } = clientApi.user.getNearbyUsers.useQuery(
    {
      latitude: location.latitude!,
      longitude: location.longitude!,
      radiusKm: 200, // 10km radius
    },
    {
      enabled: !!location.latitude && !!location.longitude && location.isEnabled,
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 seconds
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  )

  useEffect(() => {
    if (nearbyUsersData) {
      setNearbyUsers(nearbyUsersData)
    }
  }, [nearbyUsersData])

  // Update location in database only if there's a significant change
  const updateLocationInDB = useCallback(async (latitude: number, longitude: number, lastLat?: number, lastLon?: number) => {
    // Only update if location changed significantly (more than 50 meters for real-time tracking)
    if (lastLat && lastLon) {
      const distance = calculateDistance(latitude, longitude, lastLat, lastLon)
      if (distance < 0.05) { // Less than 50 meters
        return
      }
    }

    try {
      await mutateAsync({
        latitude,
        longitude,
      })
    } catch (error) {
      console.error("Failed to update location in database:", error)
    }
  }, [mutateAsync])

  // Helper function to calculate distance between two points in kilometers
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, [])

  // Get current position
  const getCurrentPosition = useCallback(async () => {
    setLocation(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      let position: GeolocationPosition | any

      if (isNative) {
        // Use Capacitor Geolocation for native apps
        const coordinates = await Geolocation.getCurrentPosition({
          enableHighAccuracy,
          timeout,
        })
        position = {
          coords: {
            latitude: coordinates.coords.latitude,
            longitude: coordinates.coords.longitude,
            accuracy: coordinates.coords.accuracy,
          }
        }
      } else {
        // Use browser geolocation for web
        if (!navigator.geolocation) {
          throw new Error("Geolocation is not supported by this browser")
        }

        position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy,
            timeout,
            maximumAge,
          })
        })
      }

      const { latitude, longitude, accuracy } = position.coords
      setLocation(prev => {
        const now = new Date()
        const isSignificantChange = !prev.latitude || !prev.longitude || 
          calculateDistance(latitude, longitude, prev.latitude, prev.longitude) >= 0.05
        
        // Update location in database only if there's a significant change
        if (isSignificantChange) {
          updateLocationInDB(latitude, longitude, prev.latitude, prev.longitude)
        }
        
        return {
          ...prev,
          latitude,
          longitude,
          accuracy,
          isEnabled: true,
          isLoading: false,
          error: null,
          lastUpdated: now,
          isLiveLocation: true,
        }
      })
    } catch (error: any) {
      let errorMessage = "Unknown error occurred"
      
      if (isNative) {
        // Handle Capacitor errors
        if (error.message?.includes('permission')) {
          errorMessage = "Location permission denied"
        } else if (error.message?.includes('unavailable')) {
          errorMessage = "Location information is unavailable"
        } else if (error.message?.includes('timeout')) {
          errorMessage = "Location request timed out"
        } else {
          errorMessage = error.message || "Failed to get location"
        }
      } else {
        // Handle browser geolocation errors
        if (error.code) {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied by user"
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable"
              break
            case error.TIMEOUT:
              errorMessage = "Location request timed out"
              break
          }
        } else {
          errorMessage = error.message || "Failed to get location"
        }
      }
      
      setLocation(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        isEnabled: false,
      }))

      toast.error(errorMessage)
    }
  }, [enableHighAccuracy, timeout, maximumAge, updateLocationInDB, isNative, calculateDistance])

  // Subscribe to real-time location updates
  const subscribeToLocationUpdates = useCallback(() => {
    if (!location.isEnabled || !location.latitude || !location.longitude || !userData) return

    // Calculate bounding box for the current user's region
    const latDiff = 10 / 111.32; // ~10km in degrees latitude
    const lonDiff = 10 / (111.32 * Math.cos(location.latitude * Math.PI / 180)); // ~10km in degrees longitude
    
    const minLat = location.latitude - latDiff;
    const maxLat = location.latitude + latDiff;
    const minLon = location.longitude - lonDiff;
    const maxLon = location.longitude + lonDiff;

    const locationChannel = supabase
      .channel('user-locations')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'UserLocation',
          filter: `isEnabled=eq.true`
        },
        async (payload) => {
          if (userData.id === payload.new.userId) return;
          // Only invalidate if the updated location is within the user's region
          const updatedLat = payload.new.latitude;
          const updatedLon = payload.new.longitude;
          
          if (
            updatedLat >= minLat && 
            updatedLat <= maxLat && 
            updatedLon >= minLon && 
            updatedLon <= maxLon
          ) {
            // Invalidate the query to trigger a refetch
            await refetchNearbyUsers();
          }
        }
      )
      .subscribe()

    setChannel(locationChannel)
  }, [location.isEnabled, location.latitude, location.longitude, userData])

  // Unsubscribe from location updates
  const unsubscribeFromLocationUpdates = useCallback(() => {
    if (channel) {
      supabase.removeChannel(channel)
      setChannel(null)
    }
  }, [channel])

  // Request location permission
  const requestLocationPermission = useCallback(async () => {
    try {
      if (isNative) {
        const permissions = await Geolocation.requestPermissions()
        
        if (permissions.location === 'granted') {
          toast.success('Location permission granted!')
          getCurrentPosition()
        } else if (permissions.location === 'denied') {
          toast.error('Location permission denied. Please enable it in your device settings.')
          setLocation(prev => ({
            ...prev,
            error: 'Location permission denied',
            isLoading: false
          }))
        } else {
          toast.warning('Location permission not granted.')
          setLocation(prev => ({
            ...prev,
            error: 'Location permission not granted',
            isLoading: false
          }))
        }
      } else {
        // For mobile browsers, we need to handle permissions differently
        if (!('geolocation' in navigator)) {
          toast.error('Geolocation is not supported by this browser.')
          setLocation(prev => ({
            ...prev,
            error: 'Geolocation not supported',
            isLoading: false
          }))
          return
        }

        // Check if Permissions API is available to query permission state
        if (navigator.permissions && navigator.permissions.query) {
          try {
            const permissionStatus = await navigator.permissions.query({ name: 'geolocation' })
            
            if (permissionStatus.state === 'denied') {
              toast.error('Location permission denied. Please enable it in your browser settings.')
              setLocation(prev => ({
                ...prev,
                error: 'Location permission denied',
                isLoading: false
              }))
              return
            }
            
            // Permission is granted or prompt - proceed with getting location
            await getCurrentPosition()
            
          } catch (permError) {
            // Permissions API might not be supported (iOS Safari) or query might fail
            // Fall back to directly requesting location
            console.log('Permissions API not available, requesting location directly:', permError)
            await getCurrentPosition()
          }
        } else {
          // Permissions API not available (e.g., iOS Safari)
          // Directly request location - this will trigger the browser's permission prompt
          await getCurrentPosition()
        }
      }
    } catch (error) {
      console.error('Error requesting location permission:', error)
      toast.error('Failed to request location permission.')
      setLocation(prev => ({
        ...prev,
        error: 'Failed to request location permission',
        isLoading: false
      }))
    }
  }, [getCurrentPosition, isNative])

  // Stop location tracking
  const stopLocationTracking = useCallback(() => {
    setLocation(prev => ({
      ...prev,
      isEnabled: false,
      error: null,
      isLiveLocation: false,
    }))
    unsubscribeFromLocationUpdates()
  }, [unsubscribeFromLocationUpdates])

  // Check if location is considered "live" (updated within last 5 minutes)
  const isLocationLive = useCallback(() => {
    if (!location.lastUpdated) return false
    const now = new Date()
    const diffInMinutes = (now.getTime() - location.lastUpdated.getTime()) / (1000 * 60)
    return diffInMinutes <= 5
  }, [location.lastUpdated])

  // Get location status text
  const getLocationStatus = useCallback(() => {
    if (!location.isEnabled) return "Location disabled"
    if (!location.lastUpdated) return "Location not available"
    
    const isLive = isLocationLive()
    if (isLive) return "Live location"
    
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - location.lastUpdated.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `Last located ${diffInMinutes} minutes ago`
    } else if (diffInMinutes < 1440) { // Less than 24 hours
      const hours = Math.floor(diffInMinutes / 60)
      return `Last located ${hours} hour${hours > 1 ? 's' : ''} ago`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `Last located ${days} day${days > 1 ? 's' : ''} ago`
    }
  }, [location.isEnabled, location.lastUpdated, isLocationLive])

  // Page visibility detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Auto-update location at intervals (only when page is visible)
  useEffect(() => {
    if (!autoUpdate || !location.isEnabled || !isPageVisible) return

    const interval = setInterval(() => {
      getCurrentPosition()
    }, updateInterval)

    return () => clearInterval(interval)
  }, [autoUpdate, location.isEnabled, updateInterval, isPageVisible])
  
  // Update nearby users when location changes significantly
  useEffect(() => {
    if (!location.latitude || !location.longitude) return;
    
    const timeoutId = setTimeout(() => {
      refetchNearbyUsers();
    }, 1000); // Debounce to avoid too many refetches
    
    return () => clearTimeout(timeoutId);
  }, [location.latitude, location.longitude]);

  // Subscribe to real-time updates when location is enabled
  useEffect(() => {
    if (location.isEnabled) {
      subscribeToLocationUpdates()
    } else {
      unsubscribeFromLocationUpdates()
    }

    return () => {
      unsubscribeFromLocationUpdates()
    }
  }, [location.isEnabled])

  return {
    ...location,
    nearbyUsers,
    requestLocationPermission,
    stopLocationTracking,
    getCurrentPosition,
    isLocationLive: isLocationLive(),
    getLocationStatus,
  }
}
