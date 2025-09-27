"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, 
  Star, 
  MessageCircle, 
  Clock,
  User,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';

interface Request {
  id: string;
  title?: string;
  description?: string;
  status: string;
  createdAt: string;
  // Helper-specific information
  myInterestStatus?: string | null;
  isRejected: boolean;
  rejectionReason?: string | null;
  rejectedAt?: string | null;
}

interface Seeker {
  id: string;
  name: string;
  profilePicture?: string;
  averageRating?: number;
  distance: number; // in km
  isOnline?: boolean;
  activeRequests: Request[];
  timePosted?: string; // e.g., "2 hours ago"
}

interface SeekerListProps {
  seekers: Seeker[];
  onSelectSeeker: (seeker: Seeker, request?: Request) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function SeekerList({ 
  seekers, 
  onSelectSeeker, 
  loading = false,
  emptyMessage = "No seekers found in your area"
}: SeekerListProps) {
  const getRequestStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Badge variant="outline" className="text-green-600 border-green-600">Open</Badge>;
      case 'UNDER_REVIEW':
        return <Badge variant="outline" className="text-blue-600 border-blue-600"><Eye className="w-3 h-3 mr-1" />Under Review</Badge>;
      case 'BARGAINING':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Bargaining</Badge>;
      case 'CONFIRMED':
        return <Badge variant="default" className="bg-purple-600">Confirmed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getInterestStatusInfo = (request: Request) => {
    if (request.isRejected) {
      return {
        badge: <Badge variant="destructive" className="text-xs"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>,
        message: `Rejected: ${request.rejectionReason}`,
        canApply: false
      };
    }

    if (request.myInterestStatus) {
      switch (request.myInterestStatus) {
        case 'PENDING':
          return {
            badge: <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs"><Clock className="w-3 h-3 mr-1" />Pending</Badge>,
            message: "Your interest is pending review",
            canApply: false
          };
        case 'ACCEPTED':
          return {
            badge: <Badge variant="default" className="bg-green-600 text-xs"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>,
            message: "Your interest was accepted! Start bargaining.",
            canApply: false
          };
        case 'REJECTED':
          return {
            badge: <Badge variant="destructive" className="text-xs"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>,
            message: "Your interest was rejected",
            canApply: false
          };
        case 'WITHDRAWN':
          return {
            badge: <Badge variant="secondary" className="text-xs">Withdrawn</Badge>,
            message: "You withdrew your interest",
            canApply: true
          };
        default:
          return { badge: null, message: null, canApply: true };
      }
    }

    return { badge: null, message: null, canApply: request.status === 'OPEN' };
  };
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (seekers.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No Requests Found</h3>
        <p className="text-muted-foreground">{emptyMessage}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Try increasing your search distance or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {seekers.map((seeker) => (
        <div key={seeker.id} className="space-y-2">
          {seeker.activeRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={seeker.profilePicture} alt={seeker.name} />
                      <AvatarFallback>
                        {seeker.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {seeker.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  {/* Request Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {request.title || 'Help Needed'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>by {seeker.name}</span>
                          <span>•</span>
                          <MapPin className="w-3 h-3" />
                          <span>{seeker.distance.toFixed(1)} km away</span>
                          {seeker.isOnline && (
                            <>
                              <span>•</span>
                              <span className="text-green-600">Online</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Rating */}
                      {seeker.averageRating && (
                        <div className="flex items-center gap-1 text-sm ml-2">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{seeker.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {request.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {request.description}
                      </p>
                    )}

                    {/* Time and Status */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>
                          Posted {new Date(request.createdAt).toLocaleDateString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getRequestStatusBadge(request.status)}
                        {(() => {
                          const interestInfo = getInterestStatusInfo(request);
                          return interestInfo.badge;
                        })()}
                      </div>
                    </div>

                    {/* Interest Status Message */}
                    {(() => {
                      const interestInfo = getInterestStatusInfo(request);
                      if (interestInfo.message) {
                        return (
                          <div className={`text-xs p-2 rounded-lg mb-2 ${
                            request.isRejected 
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : request.myInterestStatus === 'ACCEPTED'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            <div className="flex items-center gap-1">
                              {request.isRejected ? (
                                <AlertTriangle className="w-3 h-3" />
                              ) : request.myInterestStatus === 'ACCEPTED' ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <Clock className="w-3 h-3" />
                              )}
                              <span>{interestInfo.message}</span>
                            </div>
                            {request.isRejected && request.rejectedAt && (
                              <div className="text-xs opacity-75 mt-1">
                                Rejected on {new Date(request.rejectedAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Action Button */}
                    {(() => {
                      const interestInfo = getInterestStatusInfo(request);
                      
                      if (request.myInterestStatus === 'ACCEPTED') {
                        return (
                          <Button 
                            onClick={() => onSelectSeeker(seeker, request)}
                            size="sm"
                            className="w-full mt-3 bg-green-600 hover:bg-green-700"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Start Chat & Bargain
                          </Button>
                        );
                      }
                      
                      if (interestInfo.canApply) {
                        return (
                          <Button 
                            onClick={() => onSelectSeeker(seeker, request)}
                            size="sm"
                            className="w-full mt-3"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            {request.myInterestStatus === 'WITHDRAWN' ? 'Re-apply' : 'Offer Help'}
                          </Button>
                        );
                      }
                      
                      return (
                        <Button 
                          size="sm"
                          className="w-full mt-3"
                          disabled
                          variant="outline"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          {request.isRejected ? 'Rejected' : 'Interest Submitted'}
                        </Button>
                      );
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
}
