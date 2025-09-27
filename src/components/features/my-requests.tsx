"use client";

import { useState, useEffect } from 'react';
import { clientApi } from '@/trpc/react';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RequestManagement } from './request-management';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Calendar, 
  Users, 
  MessageCircle,
  Eye,
  Settings,
  Plus,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { RequestStatus } from '@prisma/client';
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { CreateRequestForm } from '@/components/forms';
import { useLocation } from '@/components/providers/location-provider';
import { supabaseBrowser } from '@/util/supabase/browser';
import { toast } from 'sonner';

function CreateRequestButton() {
  const [isCreateRequestOpen, setIsCreateRequestOpen] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { getCurrentLocation, latitude, longitude, locationSharingEnabled } = useLocation();

  const handleCreateRequest = async () => {
    setIsGettingLocation(true);
    try {
      // If location sharing is enabled and we have current location, use it
      if (locationSharingEnabled && latitude && longitude) {
        setIsCreateRequestOpen(true);
        setIsGettingLocation(false);
        return;
      }

      // Otherwise, get current location
      const location = await getCurrentLocation();
      if (location) {
        setIsCreateRequestOpen(true);
      }
    } catch (error) {
      // Error already handled in getCurrentLocation
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleRequestSuccess = () => {
    setIsCreateRequestOpen(false);
    toast.success("Request created successfully!");
    window.location.reload();
  };

  return (
    <>
      <Button 
        onClick={handleCreateRequest}
        disabled={isGettingLocation}
      >
        {isGettingLocation ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Plus className="mr-2 h-4 w-4" />
        )}
        {isGettingLocation ? "Getting Location..." : "Create Request"}
      </Button>

      <Drawer open={isCreateRequestOpen} onOpenChange={setIsCreateRequestOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Create New Request</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4">
            {((locationSharingEnabled && latitude && longitude) || (!locationSharingEnabled)) && (
              <CreateRequestForm
                latitude={latitude || 0}
                longitude={longitude || 0}
                onSuccess={handleRequestSuccess}
              />
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export function MyRequests() {
  const { userData } = useAuth();
  const { data: requests, isLoading, refetch } = clientApi.request.getMySeekerRequests.useQuery();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Set up real-time subscriptions for request updates
  useEffect(() => {
    if (!userData?.id) return;

    const supabase = supabaseBrowser();
    
    const channel = supabase
      .channel('request-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Request',
          filter: `seekerId=eq.${userData.id}`
        },
        async (payload) => {
          console.log('Request updated:', payload);
          setIsUpdating(true);
          await refetch();
          setTimeout(() => setIsUpdating(false), 500);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'RequestInterest'
        },
        async (payload) => {
          console.log('Request interest updated:', payload);
          setIsUpdating(true);
          await refetch();
          setTimeout(() => setIsUpdating(false), 500);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'RequestRejection'
        },
        async (payload) => {
          console.log('Request rejection updated:', payload);
          setIsUpdating(true);
          await refetch();
          setTimeout(() => setIsUpdating(false), 500);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Conversation'
        },
        async (payload) => {
          console.log('Conversation updated:', payload);
          setIsUpdating(true);
          await refetch();
          setTimeout(() => setIsUpdating(false), 500);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userData?.id, refetch]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Badge variant="outline" className="text-green-600 border-green-600">Open</Badge>;
      case 'UNDER_REVIEW':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Under Review</Badge>;
      case 'BARGAINING':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Bargaining</Badge>;
      case 'CONFIRMED':
        return <Badge variant="default" className="bg-purple-600">Confirmed</Badge>;
      case 'COMPLETED':
        return <Badge variant="default" className="bg-green-600">Completed</Badge>;
      case 'CLOSED':
        return <Badge variant="secondary">Closed</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Requests Yet</h3>
          <p className="text-muted-foreground mb-4">
            You haven&apos;t created any help requests yet. Create your first request to get started!
          </p>
          <CreateRequestButton />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${isUpdating ? 'opacity-75 transition-opacity' : ''}`}>
      {requests.map((request) => (
        <Card key={request.id} className={isUpdating ? 'ring-2 ring-blue-200 ring-opacity-50' : ''}>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="space-y-2 flex-1 min-w-0">
                <CardTitle className="flex flex-wrap items-center gap-2 text-base sm:text-lg">
                  <span className="truncate">{request.title || 'Help Request'}</span>
                  {getStatusBadge(request.status)}
                  {isUpdating && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </CardTitle>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Created {new Date(request.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{request._count.interests} interested helpers</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Manage Request Button */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedRequestId(request.id)}
                      className="text-xs sm:text-sm"
                    >
                      <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span className="inline">Manage</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Manage Request</DialogTitle>
                    </DialogHeader>
                    {selectedRequestId === request.id && (
                      <RequestManagement 
                        requestId={request.id} 
                        onRequestUpdate={() => {
                          refetch();
                        }}
                      />
                    )}
                  </DialogContent>
                </Dialog>

                {/* Chat Button */}
                {request.conversationId && (
                  <Link href={`/chat/${request.conversationId}`}>
                    <Button size="sm" className="text-xs sm:text-sm">
                      <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Chat
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardHeader>

          {request.description && (
            <CardContent>
              <p className="text-muted-foreground">{request.description}</p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
