"use client";

import { useLocation } from '@/components/providers/location-provider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarMenuSub,
  SidebarMenuSubItem,
  useSidebar
} from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function LocationSettings() {
  const { state } = useSidebar();
  const {
    latitude,
    longitude,
    accuracy,
    isEnabled,
    isLoading,
    error,
    lastUpdated,
    locationSharingEnabled,
    setLocationSharingEnabled,
    enableLocation,
    disableLocation,
    refreshLocation,
  } = useLocation();

  const handleToggleLocation = async () => {
    if (locationSharingEnabled) {
      disableLocation();
    } else {
      try {
        await enableLocation();
      } catch (error) {
        // Error already handled in the provider
      }
    }
  };

  const getLocationStatus = () => {
    if (isLoading) {
      return {
        icon: <Loader2 className="w-4 h-4 animate-spin" />,
        text: "Getting location...",
        badge: <Badge variant="secondary" className="text-xs">Loading</Badge>,
        shortText: "Loading..."
      };
    }

    if (error) {
      return {
        icon: <AlertCircle className="w-4 h-4 text-red-500" />,
        text: "Location error",
        badge: <Badge variant="destructive" className="text-xs">Error</Badge>,
        shortText: "Error"
      };
    }

    if (isEnabled && latitude && longitude) {
      return {
        icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
        text: `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
        badge: <Badge variant="default" className="bg-green-600 text-xs">Active</Badge>,
        shortText: "Active"
      };
    }

    return {
      icon: <MapPin className="w-4 h-4 text-muted-foreground" />,
      text: "Location disabled",
      badge: <Badge variant="outline" className="text-xs">Disabled</Badge>,
      shortText: "Disabled"
    };
  };

  const locationStatus = getLocationStatus();

  // Collapsed sidebar view - just icon with tooltip
  if (state === 'collapsed') {
    return (
      <SidebarMenuItem>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarMenuButton 
                onClick={handleToggleLocation}
                disabled={isLoading}
                className="w-full justify-center"
              >
                {locationStatus.icon}
              </SidebarMenuButton>
            </TooltipTrigger>
            <TooltipContent side="right" className="flex flex-col gap-1">
              <div className="font-medium">Location Sharing</div>
              <div className="text-xs text-muted-foreground">{locationStatus.shortText}</div>
              {isEnabled && latitude && longitude && (
                <div className="text-xs font-mono">{locationStatus.text}</div>
              )}
              <div className="text-xs">Click to {locationSharingEnabled ? 'disable' : 'enable'}</div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </SidebarMenuItem>
    );
  }

  // Expanded sidebar view
  return (
    <SidebarMenuItem>
      <div className="flex items-center justify-between w-full min-w-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {locationStatus.icon}
          <span className="text-sm truncate">Location</span>
        </div>
        <Switch
          checked={locationSharingEnabled}
          onCheckedChange={handleToggleLocation}
          disabled={isLoading}
          className="flex-shrink-0"
        />
      </div>
      
      <SidebarMenuSub>
        <SidebarMenuSubItem>
          <div className="flex items-center justify-between w-full px-2 py-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-xs text-muted-foreground">Status:</span>
              {locationStatus.badge}
            </div>
            {isEnabled && !isLoading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshLocation}
                className="h-6 w-6 p-0 flex-shrink-0"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            )}
          </div>
        </SidebarMenuSubItem>
        
        {isEnabled && latitude && longitude && (
          <SidebarMenuSubItem>
            <div className="px-2 py-1 min-w-0">
              <div className="text-xs text-muted-foreground mb-1">Location:</div>
              <div className="text-xs font-mono bg-muted p-1 rounded break-all">
                {locationStatus.text}
              </div>
              {accuracy && (
                <div className="text-xs text-muted-foreground mt-1">
                  ±{Math.round(accuracy)}m
                </div>
              )}
              {lastUpdated && (
                <div className="text-xs text-muted-foreground mt-1">
                  {lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </div>
          </SidebarMenuSubItem>
        )}
        
        {error && (
          <SidebarMenuSubItem>
            <div className="px-2 py-1 min-w-0">
              <div className="text-xs text-red-500 bg-red-50 p-2 rounded break-words">
                {error}
              </div>
            </div>
          </SidebarMenuSubItem>
        )}
      </SidebarMenuSub>
    </SidebarMenuItem>
  );
}
