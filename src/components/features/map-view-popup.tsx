"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  MapPin, 
  Navigation, 
  Users, 
  X,
  Clock
} from 'lucide-react';
import { MapView } from './map-view';

interface MapViewPopupProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserLocation: {
    latitude: number;
    longitude: number;
    updatedAt?: string;
  };
  otherUserLocation: {
    latitude: number;
    longitude: number;
    name: string;
    updatedAt?: string;
  };
  conversationId: string;
}

export function MapViewPopup({
  isOpen,
  onClose,
  currentUserLocation,
  otherUserLocation,
  conversationId
}: MapViewPopupProps) {
  // Calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  const distance = calculateDistance(
    currentUserLocation.latitude,
    currentUserLocation.longitude,
    otherUserLocation.latitude,
    otherUserLocation.longitude
  );

  const openInMaps = () => {
    // Open in device's default map application
    const url = `https://www.google.com/maps/dir/${currentUserLocation.latitude},${currentUserLocation.longitude}/${otherUserLocation.latitude},${otherUserLocation.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] sm:h-[80vh] p-0 m-2 sm:m-8">
        <DialogHeader className="p-3 sm:p-4 pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              <span className="truncate">Live Location Map</span>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                <Users className="w-3 h-3 mr-1" />
                Both Sharing
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col flex-1 p-3 sm:p-4 pt-0 h-full">
          {/* Location Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-white dark:bg-gray-800 border rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="font-medium text-xs sm:text-sm">Your Location</span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="font-mono text-[10px] sm:text-xs break-all">
                  {currentUserLocation.latitude.toFixed(4)}, {currentUserLocation.longitude.toFixed(4)}
                </div>
                {currentUserLocation.updatedAt && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] sm:text-xs">
                      {new Date(currentUserLocation.updatedAt).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-2 sm:p-3 bg-white dark:bg-gray-800 border rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="font-medium text-xs sm:text-sm truncate">{otherUserLocation.name}</span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="font-mono text-[10px] sm:text-xs break-all">
                  {otherUserLocation.latitude.toFixed(4)}, {otherUserLocation.longitude.toFixed(4)}
                </div>
                {otherUserLocation.updatedAt && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] sm:text-xs">
                      {new Date(otherUserLocation.updatedAt).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Distance Info */}
          <div className="mb-3 sm:mb-4 p-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
              <span className="font-medium">Distance: {distance.toFixed(2)} km</span>
            </div>
          </div>

          {/* Map Container */}
          <div className="flex-1 mb-3 sm:mb-4 h-[40%]">
        <MapView 
          className="h-full"
          showNearbyUsers={false}
          showOpenRequests={false}
          onLocationChange={() => {}}
          specificUsers={[
            {
              id: 'current-user',
              name: 'You',
              latitude: currentUserLocation.latitude,
              longitude: currentUserLocation.longitude,
              isCurrentUser: true,
            },
            {
              id: 'other-user',
              name: otherUserLocation.name,
              latitude: otherUserLocation.latitude,
              longitude: otherUserLocation.longitude,
              isCurrentUser: false,
            }
          ]}
        />
      </div>

          {/* Action Buttons */}
          <div className="flex flex-col mt-auto sm:flex-row gap-2">
            <Button onClick={openInMaps} className="flex-1 text-sm">
              <Navigation className="w-4 h-4 mr-2" />
              Get Directions
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
