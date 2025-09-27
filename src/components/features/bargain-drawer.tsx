"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { clientApi } from '@/trpc/react';
import { toast } from 'sonner';
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Handshake,
  History
} from 'lucide-react';
import { BargainStatus } from '@prisma/client';

const bargainFormSchema = z.object({
  amount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "Amount must be a positive number"),
});

type BargainFormData = z.infer<typeof bargainFormSchema>;

interface BargainDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  currentUserId: string;
  isSeeker: boolean;
}

export function BargainDrawer({ 
  isOpen, 
  onOpenChange, 
  conversationId, 
  currentUserId, 
  isSeeker 
}: BargainDrawerProps) {
  const [showHistory, setShowHistory] = useState(false);

  const form = useForm<BargainFormData>({
    resolver: zodResolver(bargainFormSchema),
    defaultValues: {
      amount: '',
    },
  });

  // API calls
  const { data: currentBargain, refetch: refetchBargain } = clientApi.bargain.getCurrentBargain.useQuery(
    { conversationId },
    { enabled: isOpen }
  );

  const { data: bargainHistory } = clientApi.bargain.getBargainHistory.useQuery(
    { conversationId },
    { enabled: showHistory }
  );

  const createOfferMutation = clientApi.bargain.createOffer.useMutation();
  const acceptOfferMutation = clientApi.bargain.acceptOffer.useMutation();
  const confirmDealMutation = clientApi.bargain.confirmDeal.useMutation();
  const cancelBargainMutation = clientApi.bargain.cancelBargain.useMutation();
  const createTransactionMutation = clientApi.payment.createServiceTransaction.useMutation();
  const updateRequestStatusMutation = clientApi.request.updateRequestStatus.useMutation();

  const onSubmitOffer = async (data: BargainFormData) => {
    try {
      await createOfferMutation.mutateAsync({
        conversationId,
        amount: parseFloat(data.amount),
      });

      // Update request status to BARGAINING if this is the first offer
      if (!currentBargain) {
        try {
          await updateRequestStatusMutation.mutateAsync({
            requestId: conversationId, // Assuming conversationId relates to requestId
            status: 'BARGAINING'
          });
        } catch (error) {
          console.log('Could not update request status:', error);
        }
      }
      
      toast.success('Offer submitted successfully!');
      form.reset();
      await refetchBargain();
    } catch (error) {
      toast.error('Failed to submit offer. Please try again.');
    }
  };

  const handleAcceptOffer = async () => {
    if (!currentBargain) return;
    
    try {
      await acceptOfferMutation.mutateAsync({ bargainId: currentBargain.id });
      toast.success('Offer accepted!');
      await refetchBargain();
    } catch (error) {
      toast.error('Failed to accept offer. Please try again.');
    }
  };

  const handleConfirmDeal = async () => {
    if (!currentBargain) return;
    
    try {
      await confirmDealMutation.mutateAsync({ bargainId: currentBargain.id });
      
      // Create service transaction automatically
      await createTransactionMutation.mutateAsync({
        conversationId,
        bargainId: currentBargain.id
      });

      // Update request status to CONFIRMED
      try {
        await updateRequestStatusMutation.mutateAsync({
          requestId: conversationId, // This should be the actual requestId
          status: 'CONFIRMED'
        });
      } catch (error) {
        console.log('Could not update request status:', error);
      }
      
      toast.success('Deal confirmed! Service transaction created.');
      await refetchBargain();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to confirm deal. Please try again.');
    }
  };

  const handleCancelBargain = async () => {
    if (!currentBargain) return;
    
    try {
      await cancelBargainMutation.mutateAsync({ bargainId: currentBargain.id });
      toast.success('Bargain cancelled.');
      await refetchBargain();
    } catch (error) {
      toast.error('Failed to cancel bargain. Please try again.');
    }
  };

  const getStatusBadge = (status: BargainStatus) => {
    switch (status) {
      case BargainStatus.PENDING_HELPER_RESPONSE:
        return <Badge variant="outline" className="text-orange-600 border-orange-600"><Clock className="w-3 h-3 mr-1" />Waiting for Helper</Badge>;
      case BargainStatus.PENDING_SEEKER_RESPONSE:
        return <Badge variant="outline" className="text-orange-600 border-orange-600"><Clock className="w-3 h-3 mr-1" />Waiting for Seeker</Badge>;
      case BargainStatus.AGREED:
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Agreed</Badge>;
      case BargainStatus.CONFIRMED:
        return <Badge variant="default" className="bg-green-600"><Handshake className="w-3 h-3 mr-1" />Confirmed</Badge>;
      case BargainStatus.CANCELLED:
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const canMakeOffer = () => {
    if (!currentBargain) return true;
    return currentBargain.status !== BargainStatus.CONFIRMED && 
           currentBargain.status !== BargainStatus.CANCELLED;
  };

  const canAcceptOffer = () => {
    if (!currentBargain) return false;
    
    const isPendingMyResponse = (
      (isSeeker && currentBargain.status === BargainStatus.PENDING_SEEKER_RESPONSE) ||
      (!isSeeker && currentBargain.status === BargainStatus.PENDING_HELPER_RESPONSE)
    );
    
    return isPendingMyResponse && currentBargain.initiatedBy !== currentUserId;
  };

  const canConfirmDeal = () => {
    return currentBargain?.status === BargainStatus.AGREED && isSeeker;
  };

  const canCancelBargain = () => {
    return currentBargain && 
           currentBargain.status !== BargainStatus.CONFIRMED && 
           currentBargain.status !== BargainStatus.CANCELLED;
  };

  return (
    // <Drawer open={isOpen} onOpenChange={onOpenChange}>
    //   <DrawerContent className="max-h-[85vh]">
    //     <DrawerHeader className="pb-4">
    //       <DrawerTitle className="flex items-center gap-2">
    //         <DollarSign className="w-5 h-5" />
    //         Bargain for Service
    //       </DrawerTitle>
    //       <DrawerDescription>
    //         Negotiate the price for this service. Both parties need to agree before the seeker can confirm the deal.
    //       </DrawerDescription>
    //     </DrawerHeader>

        <div className="px-4 pb-4 space-y-4 overflow-y-auto flex-1">
          {/* Current Bargain Status */}
          {currentBargain && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Current Offer</h3>
                {getStatusBadge(currentBargain.status)}
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-primary">
                    ${currentBargain.currentAmount.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    by {currentBargain.initiator.name}
                  </span>
                </div>
                
                {/* Approval Status */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    {currentBargain.helperApproved ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                    )}
                    <span>Helper {currentBargain.helperApproved ? 'Approved' : 'Pending'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {currentBargain.seekerApproved ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                    )}
                    <span>Seeker {currentBargain.seekerApproved ? 'Approved' : 'Pending'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {canAcceptOffer() && (
                  <Button 
                    onClick={handleAcceptOffer} 
                    disabled={acceptOfferMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {acceptOfferMutation.isPending ? 'Accepting...' : 'Accept Offer'}
                  </Button>
                )}
                
                {canConfirmDeal() && (
                  <Button 
                    onClick={handleConfirmDeal} 
                    disabled={confirmDealMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {confirmDealMutation.isPending ? 'Confirming...' : 'Confirm Deal'}
                  </Button>
                )}
                
                {canCancelBargain() && (
                  <Button 
                    variant="destructive" 
                    onClick={handleCancelBargain} 
                    disabled={cancelBargainMutation.isPending}
                  >
                    {cancelBargainMutation.isPending ? 'Cancelling...' : 'Cancel'}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* New Offer Form */}
          {canMakeOffer() && (
            <>
              {currentBargain && <Separator />}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {currentBargain ? 'Make Counter Offer' : 'Make Initial Offer'}
                </h3>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitOffer)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0.01"
                              placeholder="Enter amount"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      disabled={createOfferMutation.isPending}
                      className="w-full"
                    >
                      {createOfferMutation.isPending ? 'Submitting...' : 'Submit Offer'}
                    </Button>
                  </form>
                </Form>
              </div>
            </>
          )}

          {/* Bargain History */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              onClick={() => setShowHistory(!showHistory)}
              className="w-full justify-start"
            >
              <History className="w-4 h-4 mr-2" />
              {showHistory ? 'Hide' : 'Show'} Bargain History
            </Button>
            
            {showHistory && bargainHistory && bargainHistory.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {bargainHistory.map((bargain) => (
                  <div key={bargain.id} className="border rounded-lg p-3 text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">${bargain.currentAmount.toFixed(2)}</span>
                      {getStatusBadge(bargain.status)}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Initiated by {bargain.initiator.name} • {new Date(bargain.createdAt).toLocaleString()}
                    </div>
                    {bargain.offers.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="text-xs font-medium">Offers:</div>
                        {bargain.offers.map((offer) => (
                          <div key={offer.id} className="text-xs text-muted-foreground ml-2">
                            ${offer.amount.toFixed(2)} by {offer.offerer.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

    //     <DrawerFooter>
    //       <DrawerClose asChild>
    //         <Button variant="outline">Close</Button>
    //       </DrawerClose>
    //     </DrawerFooter>
    //   </DrawerContent>
    // </Drawer>
  );
}
