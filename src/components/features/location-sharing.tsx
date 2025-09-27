"use client";

import { useState, useEffect } from 'react';
import { clientApi } from '@/trpc/react';
import { useLocation } from '@/components/providers/location-provider';
import { supabaseBrowser } from '@/util/supabase/browser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  MapPin, 
  Share2, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Navigation,
  Clock,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

interface LocationSharingProps {
  conversationId: string;
  isSeeker: boolean;
  otherUserName: string;
  bargainAmount: number;
}

export function LocationSharing({
  conversationId,
  isSeeker,
  otherUserName,
  bargainAmount
}: LocationSharingProps) {
  const { getCurrentLocation, latitude, longitude, locationSharingEnabled } = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  // API queries and mutations
  const { data: locationData, refetch: refetchLocationData } = clientApi.locationSharing.getLocationSharing.useQuery({
    conversationId
  });

  const startSharingMutation = clientApi.locationSharing.startSharing.useMutation();
  const stopSharingMutation = clientApi.locationSharing.stopSharing.useMutation();
  const updateLocationMutation = clientApi.locationSharing.updateLocation.useMutation();

  const currentUserSharing = locationData?.currentUser;
  const otherUserSharing = locationData?.otherUser;

  // Set up real-time subscriptions for location sharing updates
  useEffect(() => {
    const supabase = supabaseBrowser();
    
    const channel = supabase
      .channel(`location-sharing-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ConversationLocationSharing',
          filter: `conversationId=eq.${conversationId}`
        },
        async (payload) => {
          console.log('Location sharing updated:', payload);
          await refetchLocationData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, refetchLocationData]);

  // Update location periodically when sharing
  useEffect(() => {
    if (!currentUserSharing?.isSharing || !locationSharingEnabled) return;

    const updateInterval = setInterval(async () => {
      try {
        if (latitude && longitude) {
          await updateLocationMutation.mutateAsync({
            conversationId,
            latitude,
            longitude,
            accuracy: 10 // Default accuracy
          });
        }
      } catch (error) {
        console.error('Failed to update location:', error);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(updateInterval);
  }, [currentUserSharing?.isSharing, locationSharingEnabled, latitude, longitude, conversationId]);

  const handleToggleSharing = async () => {
    setIsProcessing(true);
    
    try {
      if (currentUserSharing?.isSharing) {
        // Stop sharing
        await stopSharingMutation.mutateAsync({ conversationId });
        toast.success('Location sharing stopped');
      } else {
        // Start sharing - get current location
        let currentLat = latitude;
        let currentLng = longitude;
        
        if (!locationSharingEnabled || !currentLat || !currentLng) {
          const location = await getCurrentLocation();
          if (!location) {
            throw new Error('Could not get current location');
          }
          currentLat = location.latitude;
          currentLng = location.longitude;
        }
        
        await startSharingMutation.mutateAsync({
          conversationId,
          latitude: currentLat,
          longitude: currentLng,
          accuracy: 10
        });
        
        toast.success('Location sharing started');
      }
      
      await refetchLocationData();
    } catch (error) {
      console.error('Failed to toggle location sharing:', error);
      toast.error('Failed to update location sharing');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewMap = () => {
    if (currentUserSharing?.isSharing && otherUserSharing?.isSharing) {
      // Both users are sharing - show map
      console.log('Opening map with both locations');
      // TODO: Implement map modal/page
      alert(`Map view:\nYou: ${currentUserSharing.latitude}, ${currentUserSharing.longitude}\n${otherUserName}: ${otherUserSharing.latitude}, ${otherUserSharing.longitude}`);
    } else {
      toast.info('Both users need to share their location to view the map');
    }
  };

  return (
    <Card className="border-2 border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
              Location Sharing
            </CardTitle>
            <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
              Deal confirmed for ${bargainAmount.toFixed(2)} - Share locations to proceed
            </p>
          </div>
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmed
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Security Notice */}
        <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <Shield className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-amber-800 dark:text-amber-100 mb-1">Privacy & Security</p>
            <p className="text-amber-700 dark:text-amber-200">
              Your exact location will only be shared with {otherUserName} for this confirmed service. 
              You can stop sharing at any time using the toggle below.
            </p>
          </div>
        </div>

        {/* Location Sharing Toggle */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm">Share My Location</h4>
              {currentUserSharing?.isSharing && (
                <Badge variant="default" className="bg-green-600 text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>
            <Switch
              checked={currentUserSharing?.isSharing || false}
              onCheckedChange={handleToggleSharing}
              disabled={isProcessing}
            />
          </div>

          {/* Location Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Current User Status */}
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-background">
              <div className={`p-2 rounded-full ${
                currentUserSharing?.isSharing ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {currentUserSharing?.isSharing ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-gray-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Your Location</p>
                <p className={`text-xs ${
                  currentUserSharing?.isSharing ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {currentUserSharing?.isSharing ? 'Sharing' : 'Not sharing'}
                </p>
                {currentUserSharing?.isSharing && currentUserSharing.updatedAt && (
                  <p className="text-xs text-muted-foreground">
                    Updated {new Date(currentUserSharing.updatedAt).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>

            {/* Other User Status */}
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-background">
              <div className={`p-2 rounded-full ${
                otherUserSharing?.isSharing ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {otherUserSharing?.isSharing ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Clock className="w-4 h-4 text-gray-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{otherUserName}&apos;s Location</p>
                <p className={`text-xs ${
                  otherUserSharing?.isSharing ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {otherUserSharing?.isSharing ? 'Sharing' : 'Not sharing'}
                </p>
                {otherUserSharing?.isSharing && otherUserSharing.updatedAt && (
                  <p className="text-xs text-muted-foreground">
                    Updated {new Date(otherUserSharing.updatedAt).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* <Button
            onClick={handleViewMap}
            disabled={!currentUserSharing?.isSharing || !otherUserSharing?.isSharing}
            className="flex-1"
          >
            {currentUserSharing?.isSharing && otherUserSharing?.isSharing ? (
              <>
                <Eye className="w-4 h-4 mr-2" />
                View Map
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Map Unavailable
              </>
            )}
          </Button> */}

          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Updating...
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          {!currentUserSharing?.isSharing && (
            <p>• Toggle location sharing to help {otherUserName} find you</p>
          )}
          {!otherUserSharing?.isSharing && (
            <p>• Waiting for {otherUserName} to share their location</p>
          )}
          {currentUserSharing?.isSharing && otherUserSharing?.isSharing && (
            <p>• Both locations shared - you can now view the map and navigate</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
