"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { clientApi } from '@/trpc/react';
import { DistanceFilter, HelperList, SeekerList } from '@/components/features';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRealtimeLocation } from '@/hooks/use-realtime-location';
import { 
  MapPin, 
  Users, 
  HelpCircle, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function DiscoverPage() {
  const { userData } = useAuth();
  const router = useRouter();
  const [selectedDistance, setSelectedDistance] = useState(10); // Default 10km
  const [activeTab, setActiveTab] = useState<'helpers' | 'seekers'>('helpers');
  
  const { latitude, longitude,
    isLoading: locationLoading,
    error: locationError,
    isEnabled: locationEnabled, 
    requestLocationPermission,
    isLocationLive,
   } = useRealtimeLocation({
    autoUpdate: true,
    updateInterval: 10000, // 30 seconds for real-time tracking
  });

  // API calls
  const { data: helpers, isLoading: helpersLoading, refetch: refetchHelpers } = clientApi.user.findNearbyHelpers.useQuery(
    {
      latitude: latitude || 0,
      longitude: longitude || 0,
      radiusKm: selectedDistance,
    },
    {
      enabled: isLocationLive && activeTab === 'helpers',
    }
  );

  const { data: seekers, isLoading: seekersLoading, refetch: refetchSeekers } = clientApi.user.findNearbySeekers.useQuery(
    {
      latitude: latitude || 0,
      longitude: longitude || 0,
      radiusKm: selectedDistance,
    },
    {
      enabled: isLocationLive && activeTab === 'seekers',
    }
  );

  // API mutations
  const expressInterestMutation = clientApi.request.expressInterest.useMutation();
  const createRequestMutation = clientApi.request.create.useMutation();

  useEffect(() => {
    // Refetch when distance changes
    if (activeTab === 'helpers') {
      refetchHelpers();
    } else {
      refetchSeekers();
    }
  }, [selectedDistance, activeTab]);

  const handleSelectHelper = async (helper: any) => {
    try {
      if (!userData?.isSeeker) {
        toast.error('You need to be a seeker to contact helpers');
        return;
      }

      if (!latitude || !longitude) {
        toast.error('Location is required to create a request');
        return;
      }

      // Create a request first, then navigate to it
      const result = await createRequestMutation.mutateAsync({
        title: `Help needed near ${helper.name}`,
        description: `Request for assistance from ${helper.name}`,
        latitude,
        longitude,
      });

      toast.success(`Request created! You can now contact ${helper.name}`);
      
      // Navigate to the help page to manage the new request
      router.push('/dashboard/help');
      
    } catch (error) {
      console.error('Failed to create request:', error);
      toast.error('Failed to create request. Please try again.');
    }
  };

  const handleSelectSeeker = async (seeker: any, request?: any) => {
    try {
      if (!userData?.isHelper) {
        toast.error('You need to be a helper to show interest in requests');
        return;
      }

      if (!request) {
        toast.error('No request information available');
        return;
      }

      // Check if already expressed interest or rejected
      if (request.myInterestStatus === 'PENDING') {
        toast.info('You have already expressed interest in this request');
        return;
      }

      if (request.myInterestStatus === 'REJECTED') {
        toast.error('Your interest in this request was previously rejected');
        return;
      }

      if (request.myInterestStatus === 'ACCEPTED') {
        // Interest was accepted - navigate to chat
        if (request.conversationId) {
          router.push(`/chat/${request.conversationId}`);
        } else {
          toast.error('Conversation not found. Please contact support.');
        }
        return;
      }

      if (request.isRejected) {
        toast.error(`You were rejected for this request: ${request.rejectionReason}`);
        return;
      }

      // Express interest in the request
      await expressInterestMutation.mutateAsync({
        requestId: request.id,
        message: `Hi ${seeker.name}, I'm interested in helping with your request!`
      });

      toast.success(`Interest sent to ${seeker.name}! They will review your application.`);
      
      // Refetch seekers to update the UI
      refetchSeekers();
      
    } catch (error: any) {
      console.error('Failed to express interest:', error);
      if (error?.message?.includes('already expressed interest')) {
        toast.info('You have already expressed interest in this request');
      } else if (error?.message?.includes('rejected')) {
        toast.error('You cannot apply to this request as you were previously rejected');
      } else {
        toast.error('Failed to express interest. Please try again.');
      }
    }
  };

  const handleRefresh = () => {
    if (activeTab === 'helpers') {
      refetchHelpers();
    } else {
      refetchSeekers();
    }
    toast.success('Refreshed results');
  };

  if (locationLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Getting your location...</h2>
          <p className="text-muted-foreground">We need your location to find nearby helpers and requests</p>
        </div>
      </div>
    );
  }

  if (!locationEnabled) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Location Required</h2>
          <p className="text-muted-foreground">Please enable location access to discover nearby helpers and requests</p>
  
          <Button onClick={requestLocationPermission}>
            Enable Location
          </Button>
        </div>
      </div>
    );
  }

  if (locationError) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Location Error</h2>
          <p className="text-muted-foreground mb-4">
            {locationError}
          </p>
          <Button onClick={requestLocationPermission}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Discover</h1>
          <p className="text-muted-foreground">
            Find helpers and requests near you
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Location Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <MapPin className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Location Active</p>
              <p className="text-sm text-muted-foreground">
                Searching within {selectedDistance}km of your current location
              </p>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              Connected
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Distance Filter */}
      <DistanceFilter
        selectedDistance={selectedDistance}
        onDistanceChange={setSelectedDistance}
      />

      {/* Tabs for Helpers vs Seekers */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'helpers' | 'seekers')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="helpers" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Find Helpers
            {helpers && <Badge variant="secondary" className="ml-1">{helpers.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="seekers" className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Help Seekers
            {seekers && <Badge variant="secondary" className="ml-1">{seekers.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="helpers" className="mt-6">
          <HelperList
            helpers={(helpers || []).map(helper => ({
              ...helper,
              averageRating: helper.averageRating ?? undefined,
              expertise: helper.expertise.map(exp => ({
                skillName: exp.skillName,
                description: exp.description || undefined
              }))
            }))}
            onSelectHelper={handleSelectHelper}
            loading={helpersLoading}
            emptyMessage={`No helpers found within ${selectedDistance}km. Try increasing your search distance.`}
          />
        </TabsContent>

        <TabsContent value="seekers" className="mt-6">
          <SeekerList
            seekers={(seekers || []).map(seeker => ({
              ...seeker,
              averageRating: seeker.averageRating ?? undefined,
              profilePicture: seeker.profilePicture || undefined,
              activeRequests: seeker.activeRequests.map(req => ({
                ...req,
                title: req.title || undefined,
                description: req.description || undefined,
                rejectionReason: req.rejectionReason || undefined,
                rejectedAt: req.rejectedAt || undefined
              }))
            }))}
            onSelectSeeker={handleSelectSeeker}
            loading={seekersLoading}
            emptyMessage={`No open requests found within ${selectedDistance}km. Try increasing your search distance.`}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
