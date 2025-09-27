"use client";

import { useState, useEffect } from 'react';
import { clientApi } from '@/trpc/react';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabaseBrowser } from '@/util/supabase/browser';
import { 
  Calendar, 
  Users, 
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MapPin,
  User
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export function MyInterests() {
  const { userData } = useAuth();
  const { data: interests, isLoading, refetch } = clientApi.request.getMyHelperInterests.useQuery();
  const [isUpdating, setIsUpdating] = useState(false);

  const withdrawInterestMutation = clientApi.request.withdrawInterest.useMutation();

  // Set up real-time subscriptions for interest updates
  useEffect(() => {
    if (!userData?.id) return;

    const supabase = supabaseBrowser();
    
    const channel = supabase
      .channel('interest-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'RequestInterest',
          filter: `helperId=eq.${userData.id}`
        },
        async (payload) => {
          console.log('Interest updated:', payload);
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
          table: 'RequestRejection',
          filter: `helperId=eq.${userData.id}`
        },
        async (payload) => {
          console.log('Rejection updated:', payload);
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
          table: 'Request'
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

  const getInterestStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="text-orange-600 border-orange-600"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
      case 'REVIEWING':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Under Review</Badge>;
      case 'ACCEPTED':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'WITHDRAWN':
        return <Badge variant="secondary">Withdrawn</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRequestStatusBadge = (status: string) => {
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

  const handleWithdrawInterest = async (requestId: string) => {
    try {
      await withdrawInterestMutation.mutateAsync({ requestId });
      toast.success('Interest withdrawn successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to withdraw interest');
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

  if (!interests || interests.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Interests Yet</h3>
          <p className="text-muted-foreground mb-4">
            You haven&apos;t expressed interest in any requests yet. Browse available requests to get started!
          </p>
          <Link href="/dashboard/discover">
            <Button>Browse Requests</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${isUpdating ? 'opacity-75 transition-opacity' : ''}`}>
      {interests.map((interest) => (
        <Card key={interest.id} className={isUpdating ? 'ring-2 ring-blue-200 ring-opacity-50' : ''}>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="space-y-2 flex-1 min-w-0">
                <CardTitle className="flex flex-wrap items-center gap-2 text-base sm:text-lg">
                  <span className="truncate">{interest.request.title || 'Help Request'}</span>
                  {getRequestStatusBadge(interest.request.status)}
                  {getInterestStatusBadge(interest.status)}
                  {isUpdating && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </CardTitle>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Applied {new Date(interest.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{interest.distance ? `${interest.distance.toFixed(1)}km away` : 'Distance unknown'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 sm:ml-4">
                {/* Seeker Avatar and Info */}
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6 sm:w-8 sm:h-8">
                    <AvatarImage src={interest.request.seeker.profilePicture || ''} />
                    <AvatarFallback>
                      <User className="w-3 h-3 sm:w-4 sm:h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-xs sm:text-sm">
                    <div className="font-medium truncate max-w-20 sm:max-w-none">{interest.request.seeker.name}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {interest.request.description && (
              <p className="text-muted-foreground mb-4">{interest.request.description}</p>
            )}

            {/* Interest Message */}
            {interest.message && (
              <div className="bg-muted p-3 rounded-lg mb-4">
                <div className="text-sm font-medium mb-1">Your Message:</div>
                <div className="text-sm">{interest.message}</div>
              </div>
            )}

            {/* Rejection Reason */}
            {interest.status === 'REJECTED' && interest.rejectionReason && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-4">
                <div className="flex items-center gap-2 text-red-700 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Rejection Reason:</span>
                </div>
                <div className="text-sm text-red-600">{interest.rejectionReason}</div>
                {interest.rejectedAt && (
                  <div className="text-xs text-red-500 mt-1">
                    Rejected on {new Date(interest.rejectedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {interest.status === 'ACCEPTED' && interest.request.conversationId && (
                <Link href={`/chat/${interest.request.conversationId}`} className="flex-1 sm:flex-none">
                  <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-xs sm:text-sm">
                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    <span className="hidden sm:inline">Start Chat & Bargain</span>
                    <span className="sm:hidden">Chat & Bargain</span>
                  </Button>
                </Link>
              )}

              {(interest.status === 'PENDING' || interest.status === 'REVIEWING') && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleWithdrawInterest(interest.request.id)}
                  disabled={withdrawInterestMutation.isPending}
                  className="text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">{withdrawInterestMutation.isPending ? 'Withdrawing...' : 'Withdraw Interest'}</span>
                  <span className="sm:hidden">{withdrawInterestMutation.isPending ? 'Withdrawing...' : 'Withdraw'}</span>
                </Button>
              )}

              {interest.status === 'WITHDRAWN' && interest.request.status === 'OPEN' && (
                <Link href="/dashboard/discover" className="flex-1 sm:flex-none">
                  <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm">
                    Re-apply
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
