"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  MessageSquare,
  Eye,
  UserCheck,
  UserX,
  MapPin,
  Calendar
} from 'lucide-react';
import { clientApi } from '@/trpc/react';
import { toast } from 'sonner';
import { RequestStatus, InterestStatus } from '@prisma/client';

interface RequestManagementProps {
  requestId: string;
  onRequestUpdate?: () => void;
}

export function RequestManagement({ requestId, onRequestUpdate }: RequestManagementProps) {
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedHelperId, setSelectedHelperId] = useState<string>('');
  const [closeReason, setCloseReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  // API calls
  const { data: requestDetails, refetch } = clientApi.request.getRequestDetails.useQuery(
    { requestId },
    { refetchInterval: 5000 } // Real-time updates every 5 seconds
  );

  const closeRequestMutation = clientApi.request.closeRequest.useMutation();
  const acceptInterestMutation = clientApi.request.acceptInterest.useMutation();
  const rejectInterestMutation = clientApi.request.rejectInterest.useMutation();

  const handleCloseRequest = async () => {
    try {
      await closeRequestMutation.mutateAsync({
        requestId,
        reason: closeReason || undefined
      });
      toast.success('Request closed successfully');
      setIsCloseDialogOpen(false);
      setCloseReason('');
      await refetch();
      onRequestUpdate?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to close request');
    }
  };

  const handleAcceptInterest = async (helperId: string) => {
    try {
      await acceptInterestMutation.mutateAsync({
        requestId,
        helperId
      });
      toast.success('Helper accepted! You can now start bargaining.');
      await refetch();
      onRequestUpdate?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept helper');
    }
  };

  const handleRejectInterest = async () => {
    if (!selectedHelperId || !rejectReason.trim()) return;

    try {
      await rejectInterestMutation.mutateAsync({
        requestId,
        helperId: selectedHelperId,
        reason: rejectReason.trim()
      });
      toast.success('Helper rejected');
      setIsRejectDialogOpen(false);
      setRejectReason('');
      setSelectedHelperId('');
      await refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject helper');
    }
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.OPEN:
        return <Badge variant="outline" className="text-green-600 border-green-600">Open</Badge>;
      case RequestStatus.UNDER_REVIEW:
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Under Review</Badge>;
      case RequestStatus.BARGAINING:
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Bargaining</Badge>;
      case RequestStatus.CONFIRMED:
        return <Badge variant="default" className="bg-purple-600">Confirmed</Badge>;
      case RequestStatus.COMPLETED:
        return <Badge variant="default" className="bg-green-600">Completed</Badge>;
      case RequestStatus.CLOSED:
        return <Badge variant="secondary">Closed</Badge>;
      case RequestStatus.CANCELLED:
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getInterestStatusBadge = (status: InterestStatus) => {
    switch (status) {
      case InterestStatus.PENDING:
        return <Badge variant="outline" className="text-orange-600 border-orange-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case InterestStatus.REVIEWING:
        return <Badge variant="outline" className="text-blue-600 border-blue-600"><Eye className="w-3 h-3 mr-1" />Reviewing</Badge>;
      case InterestStatus.ACCEPTED:
        return <Badge variant="default" className="bg-green-600"><UserCheck className="w-3 h-3 mr-1" />Accepted</Badge>;
      case InterestStatus.REJECTED:
        return <Badge variant="destructive"><UserX className="w-3 h-3 mr-1" />Rejected</Badge>;
      case InterestStatus.WITHDRAWN:
        return <Badge variant="secondary">Withdrawn</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (!requestDetails) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded w-1/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Request Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2">
                {requestDetails.title || 'Help Request'}
                {getStatusBadge(requestDetails.status)}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Created {new Date(requestDetails.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{requestDetails.interests?.length || 0} interested helpers</span>
                </div>
              </div>
            </div>
            
            {requestDetails.status !== RequestStatus.CLOSED && 
             requestDetails.status !== RequestStatus.COMPLETED && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsCloseDialogOpen(true)}
                disabled={closeRequestMutation.isPending}
              >
                Close Request
              </Button>
            )}
          </div>
        </CardHeader>
        
        {requestDetails.description && (
          <CardContent>
            <p className="text-muted-foreground">{requestDetails.description}</p>
          </CardContent>
        )}
      </Card>

      {/* Interested Helpers */}
      {requestDetails.interests && requestDetails.interests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Interested Helpers ({requestDetails.interests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {requestDetails.interests.map((interest) => (
              <div key={interest.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                      {interest.helper.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-medium">{interest.helper.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Applied {new Date(interest.createdAt).toLocaleDateString()}</span>
                        {interest.helper.helperProfile?.averageRating && (
                          <>
                            <span>•</span>
                            <span>⭐ {interest.helper.helperProfile.averageRating.toFixed(1)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {getInterestStatusBadge(interest.status)}
                </div>

                {/* Helper's Expertise */}
                {interest.helper.helperProfile?.expertise && interest.helper.helperProfile.expertise.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {interest.helper.helperProfile.expertise.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill.skillName}
                        </Badge>
                      ))}
                      {interest.helper.helperProfile.expertise.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{interest.helper.helperProfile.expertise.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Helper's Message */}
                {interest.message && (
                  <div className="mb-3 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm">{interest.message}</p>
                  </div>
                )}

                {/* Actions */}
                {interest.status === InterestStatus.PENDING && requestDetails.status === RequestStatus.OPEN && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleAcceptInterest(interest.helperId)}
                      disabled={acceptInterestMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <UserCheck className="w-4 h-4 mr-1" />
                      Accept
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedHelperId(interest.helperId);
                        setIsRejectDialogOpen(true);
                      }}
                    >
                      <UserX className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}

                {interest.status === InterestStatus.ACCEPTED && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>You can now start bargaining with this helper</span>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Interests Yet */}
      {(!requestDetails.interests || requestDetails.interests.length === 0) && 
       requestDetails.status === RequestStatus.OPEN && (
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-medium mb-2">No helpers interested yet</h3>
            <p className="text-sm text-muted-foreground">
              Your request is live and helpers in your area will be notified. 
              Check back soon for interested helpers!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Close Request Dialog */}
      <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to close this request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Reason for closing (optional)
              </label>
              <Textarea
                value={closeReason}
                onChange={(e) => setCloseReason(e.target.value)}
                placeholder="e.g., Found help elsewhere, no longer needed..."
                className="min-h-[80px]"
              />
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsCloseDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCloseRequest}
                disabled={closeRequestMutation.isPending}
                className="flex-1"
              >
                {closeRequestMutation.isPending ? 'Closing...' : 'Close Request'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Helper Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Helper</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this helper. This will help improve the matching process.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Reason for rejection *
              </label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Not the right expertise, location too far, already found help..."
                className="min-h-[100px]"
                required
              />
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsRejectDialogOpen(false);
                  setRejectReason('');
                  setSelectedHelperId('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleRejectInterest}
                disabled={rejectInterestMutation.isPending || !rejectReason.trim()}
                variant="destructive"
                className="flex-1"
              >
                {rejectInterestMutation.isPending ? 'Rejecting...' : 'Reject Helper'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
