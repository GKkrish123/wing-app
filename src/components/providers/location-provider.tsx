"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRealtimeLocation } from '@/hooks/use-realtime-location';
import { toast } from 'sonner';

interface LocationContextType {
  // Location state
  latitude?: number;
  longitude?: number;
  accuracy: number | null;
  isEnabled: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Settings
  locationSharingEnabled: boolean;
  setLocationSharingEnabled: (enabled: boolean) => void;
  
  // Methods
  enableLocation: () => Promise<void>;
  disableLocation: () => void;
  getCurrentLocation: () => Promise<{latitude: number, longitude: number} | null>;
  refreshLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [locationSharingEnabled, setLocationSharingEnabled] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load location sharing preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('locationSharingEnabled');
    if (saved !== null) {
      setLocationSharingEnabled(JSON.parse(saved));
    }
    setIsInitialized(true);
  }, []);

  // Save location sharing preference to localStorage
  const handleSetLocationSharingEnabled = (enabled: boolean) => {
    setLocationSharingEnabled(enabled);
    localStorage.setItem('locationSharingEnabled', JSON.stringify(enabled));
  };

  // Use the realtime location hook only when enabled
  const {
    latitude,
    longitude,
    accuracy,
    isEnabled,
    isLoading,
    error,
    lastUpdated,
    isLiveLocation,
    requestLocationPermission,
    stopLocationTracking,
    getCurrentPosition,
  } = useRealtimeLocation({
    autoUpdate: locationSharingEnabled,
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000, // 5 minutes
    updateInterval: 30000, // 30 seconds
  });

  // Auto-enable location when preference is loaded as enabled
  useEffect(() => {
    if (isInitialized && locationSharingEnabled && !isEnabled) {
      // Silently request permission on initialization - no toast needed
      requestLocationPermission();
    }
  }, [isInitialized, locationSharingEnabled, isEnabled, requestLocationPermission]);

  const enableLocation = async (): Promise<void> => {
    try {
      if (!isEnabled) {
        requestLocationPermission();
      }
      handleSetLocationSharingEnabled(true);
      toast.success('Location sharing enabled');
    } catch (error) {
      toast.error('Failed to enable location sharing');
      throw error;
    }
  };

  const disableLocation = () => {
    stopLocationTracking();
    handleSetLocationSharingEnabled(false);
    toast.success('Location sharing disabled');
  };

  const refreshLocation = () => {
    getCurrentPosition();
  };

  const getCurrentLocation = (): Promise<{latitude: number, longitude: number} | null> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        toast.error("Geolocation is not supported by this browser");
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Failed to get your location. Please enable location access.");
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  };

  const contextValue: LocationContextType = {
    // Location state from hook
    latitude,
    longitude,
    accuracy,
    isEnabled,
    isLoading,
    error,
    lastUpdated,
    
    // Settings
    locationSharingEnabled,
    setLocationSharingEnabled: handleSetLocationSharingEnabled,
    
    // Methods
    enableLocation,
    disableLocation,
    getCurrentLocation,
    refreshLocation,
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
