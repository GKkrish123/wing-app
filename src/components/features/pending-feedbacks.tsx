"use client";

import { useState } from 'react';
import { clientApi } from '@/trpc/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  AlertTriangle, 
  Star, 
  Calendar, 
  MessageCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { MandatoryFeedbackModal } from './mandatory-feedback-modal';
import { formatDistanceToNow } from 'date-fns';

export function PendingFeedbacks() {
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const { data: pendingFeedbacks, refetch, isLoading } = clientApi.payment.getPendingFeedbacks.useQuery();

  const totalPending = (pendingFeedbacks?.asSeeker?.length || 0) + (pendingFeedbacks?.asHelper?.length || 0);

  const handleProvideFeedback = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowFeedbackModal(true);
  };

  const handleFeedbackSubmitted = () => {
    refetch();
    setSelectedTransaction(null);
    setShowFeedbackModal(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Pending Feedbacks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (totalPending === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Pending Feedbacks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-medium text-lg mb-2">All caught up!</h3>
            <p className="text-muted-foreground">
              You have no pending feedbacks to provide.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Pending Feedbacks
            <Badge variant="destructive" className="ml-auto">
              {totalPending} Required
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Services you received (as seeker) */}
            {pendingFeedbacks?.asSeeker?.map((transaction) => (
              <div
                key={transaction.id}
                className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-transparent border-blue-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={transaction.otherUser.profilePicture || undefined} />
                      <AvatarFallback>
                        {transaction.otherUser.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">
                          Service received from {transaction.otherUser.name}
                        </p>
                        <Badge variant="outline" className="text-xs text-blue-600 border-blue-600">
                          As Seeker
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {transaction.conversation.request?.title || 'Help Request'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>
                          Completed {transaction.completedAt 
                            ? formatDistanceToNow(new Date(transaction.completedAt), { addSuffix: true })
                            : 'recently'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleProvideFeedback(transaction)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Star className="w-4 h-4 mr-1" />
                    Rate Helper
                  </Button>
                </div>
              </div>
            ))}

            {/* Services you provided (as helper) */}
            {pendingFeedbacks?.asHelper?.map((transaction) => (
              <div
                key={transaction.id}
                className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-transparent border-green-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={transaction.otherUser.profilePicture || undefined} />
                      <AvatarFallback>
                        {transaction.otherUser.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">
                          Service provided to {transaction.otherUser.name}
                        </p>
                        <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                          As Helper
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {transaction.conversation.request?.title || 'Help Request'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>
                          Completed {transaction.completedAt 
                            ? formatDistanceToNow(new Date(transaction.completedAt), { addSuffix: true })
                            : 'recently'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleProvideFeedback(transaction)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Star className="w-4 h-4 mr-1" />
                    Rate Seeker
                  </Button>
                </div>
              </div>
            ))}

            {/* Important Notice */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Feedback is mandatory</p>
                  <p>
                    Please provide feedback for all completed services. Your feedback helps maintain 
                    service quality and builds trust in our community.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mandatory Feedback Modal */}
      {selectedTransaction && (
        <MandatoryFeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => {}} // Prevent closing - feedback is mandatory
          transactionId={selectedTransaction.id}
          otherUser={selectedTransaction.otherUser}
          role={selectedTransaction.role}
          requestTitle={selectedTransaction.conversation.request?.title}
          onFeedbackSubmitted={handleFeedbackSubmitted}
        />
      )}
    </>
  );
}
