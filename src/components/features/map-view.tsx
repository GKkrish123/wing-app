"use client"

import { useEffect, useRef, useState } from "react"
import { Loader } from "@googlemaps/js-api-loader"
import { clientApi } from "@/trpc/react"
import { useRealtimeLocation } from "@/hooks/use-realtime-location"
import { Button } from "@/components/ui/button"
import { MapPin, Users, RefreshCw } from "lucide-react"
import { toast } from "sonner"

type Props = {
  className?: string
  showNearbyUsers?: boolean
  showOpenRequests?: boolean
  radiusKm?: number
  onLocationChange?: (latitude: number, longitude: number) => void
  specificUsers?: {
    id: string
    name: string
    latitude: number
    longitude: number
    profilePicture?: string | null
    isCurrentUser?: boolean
  }[]
}

type OpenRequest = {
  id: string;
  title: string | null;
  description: string | null;
  latitude: number;
  longitude: number;
  seeker: {
    id: string;
    name: string;
    profilePicture: string | null;
  };
};

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

export function MapView({ 
  className, 
  showNearbyUsers = true, 
  showOpenRequests = false,
  radiusKm = 10,
  onLocationChange,
  specificUsers,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const nearbyMarkersRef = useRef<google.maps.Marker[]>([]);
  const requestMarkersRef = useRef<google.maps.Marker[]>([]);
  const [error, setError] = useState<string | null>(null)
  const [isLoadingNearby, setIsLoadingNearby] = useState(false)
  const [isMapLoading, setIsMapLoading] = useState(true)

  const { 
    latitude, 
    longitude, 
    isEnabled: locationEnabled, 
    requestLocationPermission,
    isLoading: locationLoading,
    nearbyUsers,
    isLocationLive,
    getLocationStatus,
  } = useRealtimeLocation({
    autoUpdate: true,
    updateInterval: 30000, // 30 seconds for real-time tracking
  });

  useEffect(() => {
    if (latitude && longitude) {
      onLocationChange?.(latitude, longitude);
    }
  }, [latitude, longitude]);

  const { data: openRequests } = clientApi.request.getAllOpen.useQuery(undefined, {
    enabled: showOpenRequests,
  });

  const expressInterestMutation = clientApi.request.expressInterest.useMutation();

  // Nearby users are now provided by the real-time location hook

  // Create user markers
  const createUserMarker = (user: NearbyUser) => {
    if (!mapRef.current) return null

    const isHelper = user.isHelper
    const isSeeker = user.isSeeker
    
    // Create custom marker icon
    const markerIcon = {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 12,
      fillColor: isHelper ? "#10b981" : isSeeker ? "#3b82f6" : "#6b7280",
      fillOpacity: 0.8,
      strokeColor: "white",
      strokeWeight: 2,
    }

    const marker = new google.maps.Marker({
      map: mapRef.current,
      position: {
        lat: user.latitude,
        lng: user.longitude,
      },
      title: `${user.name} (${user.isHelper ? "Helper" : user.isSeeker ? "Seeker" : "Unknown"})`,
      icon: markerIcon,
    })

    // Create info window
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 8px; background: white; border-radius: 6px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            ${user.profilePicture 
              ? `<img src="${user.profilePicture}" alt="${user.name}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" />`
              : `<div style="width: 32px; height: 32px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 500;">${user.name.charAt(0).toUpperCase()}</div>`
            }
            <div>
              <h3 style="font-weight: 500; font-size: 14px; color: #111827; margin: 0;">${user.name}</h3>
              <p style="font-size: 12px; color: #6b7280; margin: 0;">${user.isHelper ? "Helper" : user.isSeeker ? "Seeker" : "Unknown"}</p>
            </div>
          </div>
          ${user.updatedAt 
            ? `<p style="font-size: 12px; color: #9ca3af; margin: 0;">Last seen: ${new Date(user.updatedAt).toLocaleTimeString()}</p>`
            : ""
          }
        </div>
      `,
    })

    marker.addListener("click", () => {
      infoWindow.open(mapRef.current, marker)
    })

    return marker
  }

  // Create request markers
  const createRequestMarker = (request: OpenRequest) => {
    if (!mapRef.current) return null;

    const marker = new google.maps.Marker({
      map: mapRef.current,
      position: {
        lat: request.latitude,
        lng: request.longitude,
      },
      title: request.title || "Help Request",
      icon: {
        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
        fillColor: "#f59e0b",
        fillOpacity: 1,
        strokeWeight: 0,
        rotation: 0,
        scale: 1.5,
        anchor: new google.maps.Point(12, 24),
      },
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 8px; background: white; border-radius: 6px;">
          <h3 style="font-weight: 500; font-size: 14px; color: #111827; margin: 0 0 4px 0;">${request.title || 'Help Request'}</h3>
          <p style="font-size: 12px; color: #6b7280; margin: 0 0 8px 0;">${request.description || ''}</p>
          <button id="express-interest-${request.id}" style="margin-top: 8px; background: #3b82f6; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; border: none; cursor: pointer;">I'm Interested</button>
        </div>
      `,
    });

    infoWindow.addListener('domready', () => {
      const button = document.getElementById(`express-interest-${request.id}`);
      if (button) {
        button.addEventListener('click', async () => {
          try {
            await expressInterestMutation.mutateAsync({ requestId: request.id });
            toast.success("Interest expressed successfully!");
            infoWindow.close();
          } catch (error) {
            toast.error("Failed to express interest. Please try again.");
          }
        });
      }
    });

    marker.addListener("click", () => {
      infoWindow.open(mapRef.current, marker);
    });

    return marker;
  };

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    nearbyMarkersRef.current.forEach(marker => marker.setMap(null));
    nearbyMarkersRef.current = [];
    requestMarkersRef.current.forEach(marker => marker.setMap(null));
    requestMarkersRef.current = [];

    // Create new markers for open requests
    if (showOpenRequests && openRequests) {
      openRequests.forEach(request => {
        const marker = createRequestMarker(request);
        if (marker) {
          requestMarkersRef.current.push(marker);
        }
      });
    }

    // Create new markers for nearby users or specific users
    if (specificUsers) {
      // Show only specific users when provided
      specificUsers.forEach(user => {
        const marker = createUserMarker({
          id: user.id,
          name: user.name,
          latitude: user.latitude,
          longitude: user.longitude,
          profilePicture: user.profilePicture || null,
          isHelper: !user.isCurrentUser, // Non-current user is helper/green
          isSeeker: !!user.isCurrentUser, // Current user is seeker/red
          updatedAt: new Date(), // Current time for specific users
        });
        if (marker) {
          nearbyMarkersRef.current.push(marker);
        }
      });
    } else if (showNearbyUsers && nearbyUsers) {
      // Show nearby users when no specific users provided
      nearbyUsers.forEach(user => {
        const marker = createUserMarker(user);
        if (marker) {
          nearbyMarkersRef.current.push(marker);
        }
      });
    }
  }, [nearbyUsers, openRequests, showNearbyUsers, showOpenRequests, specificUsers]);

  // Center map on specific users when provided
  useEffect(() => {
    if (!mapRef.current || !specificUsers || specificUsers.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    specificUsers.forEach(user => {
      bounds.extend(new google.maps.LatLng(user.latitude, user.longitude));
    });

    // Fit the map to show both users
    mapRef.current.fitBounds(bounds);
    
    // Set a minimum zoom level to avoid being too zoomed out
    const listener = google.maps.event.addListener(mapRef.current, 'bounds_changed', () => {
      if (mapRef.current && mapRef.current.getZoom() && mapRef.current.getZoom()! > 15) {
        mapRef.current.setZoom(15);
      }
      google.maps.event.removeListener(listener);
    });
  }, [specificUsers]);

    useEffect(() => {
    if (!containerRef.current) return;

    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
      version: "weekly",
      libraries: ["marker"],
    });

    let isMounted = true;

    loader.load().then(() => {
      if (!isMounted || !containerRef.current) return;
      
      const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;
      const mapOptions: google.maps.MapOptions = {
        center: { lat: 0, lng: 0 },
        zoom: 2,
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false,
      };
      
      if (mapId && mapId !== "YOUR_MAP_ID") {
        mapOptions.mapId = mapId;
      }
      
      try {
        mapRef.current = new google.maps.Map(containerRef.current, mapOptions);
        setIsMapLoading(false);
      } catch (error) {
        console.error("Error initializing map:", error);
        setError("Failed to initialize map");
        setIsMapLoading(false);
        return;
      }

      if (latitude && longitude) {
        const position = { lat: latitude, lng: longitude };
        mapRef.current.panTo(position);
        mapRef.current.setZoom(14);

        if (markerRef.current) {
          markerRef.current.setPosition(position);
        } else {
          markerRef.current = new google.maps.Marker({
            map: mapRef.current,
            position,
            title: "You are here",
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#ef4444",
              fillOpacity: 1,
              strokeColor: "white",
              strokeWeight: 3,
            },
          });
        }
      }
    }).catch((e) => {
      console.error("Google Maps loader error:", e);
      setError(`Failed to load Google Maps: ${e.message || String(e)}`);
      setIsMapLoading(false);
    });

    return () => {
      isMounted = false;
      markerRef.current?.setMap(null);
      markerRef.current = null;
      nearbyMarkersRef.current.forEach(marker => marker.setMap(null));
      nearbyMarkersRef.current = [];
      requestMarkersRef.current.forEach(marker => marker.setMap(null));
      requestMarkersRef.current = [];
      mapRef.current = null;
    };
  }, [latitude, longitude]);

  const handleRefreshNearby = () => {
    setIsLoadingNearby(true);
    setTimeout(() => {
      setIsLoadingNearby(false);
    }, 1000);
  };

  return (
    <div className={className}>
      <div className="relative">
        <div 
          ref={containerRef} 
          className="w-full h-full rounded-lg overflow-hidden min-h-[300px] relative" 
          style={{ minHeight: '300px' }}
        />
        
        {/* Loading indicator */}
        {isMapLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}
        
        {/* Controls */}
        {showNearbyUsers && <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-col gap-1 sm:gap-2">
          {!locationEnabled && (
            <Button
              onClick={requestLocationPermission}
              disabled={locationLoading}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg text-xs sm:text-sm px-2 sm:px-3"
            >
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{locationLoading ? "Getting Location..." : "Enable Location"}</span>
              <span className="sm:hidden">{locationLoading ? "Getting..." : "Location"}</span>
            </Button>
          )}
          
          {locationEnabled && (
            <Button
              onClick={requestLocationPermission}
              disabled={locationLoading}
              size="sm"
              variant="outline"
              className="bg-background/90 hover:bg-background backdrop-blur-sm border-border shadow-lg text-xs sm:text-sm px-2 sm:px-3"
            >
              <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${locationLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Update Location</span>
              <span className="sm:hidden">Update</span>
            </Button>
          )}
          
          {showNearbyUsers && locationEnabled && (
            <Button
              onClick={handleRefreshNearby}
              disabled={isLoadingNearby}
              size="sm"
              variant="outline"
              className="bg-background/90 hover:bg-background backdrop-blur-sm border-border shadow-lg text-xs sm:text-sm px-2 sm:px-3"
            >
              <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${isLoadingNearby ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh Users</span>
              <span className="sm:hidden">Refresh</span>
            </Button>
          )}
        </div>}

        {/* Legend */}
        {showNearbyUsers && nearbyUsers.length > 0 && (
          <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-background/90 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-xs shadow-lg border border-border">
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                <span className="text-foreground text-xs">You</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                <span className="text-foreground text-xs">Helpers</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-500"></div>
                <span className="text-foreground text-xs">Seekers</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
                <span className="text-foreground text-xs">Requests</span>
              </div>
            </div>
          </div>
        )}

        {/* Location status */}
        {locationEnabled && (
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-background/90 backdrop-blur-sm rounded-lg p-1.5 sm:p-2 shadow-lg border border-border">
            <div className="flex items-center gap-1.5 sm:gap-2 text-sm">
              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isLocationLive ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
              <span className="text-xs text-foreground">{getLocationStatus()}</span>
              {isLocationLive && (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">• LIVE</span>
              )}
            </div>
          </div>
        )}

        {/* Nearby users count */}
        {showNearbyUsers && nearbyUsers.length > 0 && (
          <div className={`absolute ${locationEnabled ? 'top-12 sm:top-16' : 'top-2 sm:top-4'} left-2 sm:left-4 bg-background/90 backdrop-blur-sm rounded-lg p-1.5 sm:p-2 shadow-lg border border-border`}>
            <div className="flex items-center gap-1 text-sm">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-foreground" />
              <span className="text-foreground text-xs sm:text-sm">{nearbyUsers.length} nearby users</span>
              <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-destructive rounded-full"></div>
            <p className="text-sm text-destructive font-medium">Map Error</p>
          </div>
          <p className="mt-1 text-sm text-destructive">{error}</p>
          <p className="mt-2 text-xs text-destructive/70">
            Please check your Google Maps API key and ensure it&apos;s properly configured.
          </p>
        </div>
      )}
    </div>
  )
}


