"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CreditCard, 
  Wallet, 
  Building2,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  Shield,
  Star
} from 'lucide-react';
import { clientApi } from '@/trpc/react';
import { toast } from 'sonner';
import { PaymentStatus, ServiceStatus } from '@prisma/client';

interface PaymentFlowProps {
  conversationId: string;
  isSeeker: boolean;
  otherUserName: string;
  bargainAmount: number;
  onPaymentComplete?: () => void;
  onServiceComplete?: () => void;
}

export function PaymentFlow({
  conversationId,
  isSeeker,
  otherUserName,
  bargainAmount,
  onPaymentComplete,
  onServiceComplete
}: PaymentFlowProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // API calls
  const { data: transaction, refetch: refetchTransaction } = clientApi.payment.getServiceTransaction.useQuery(
    { conversationId },
    { refetchInterval: 5000 } // Refetch every 5 seconds for status updates
  );

  const createTransactionMutation = clientApi.payment.createServiceTransaction.useMutation();
  const processPaymentMutation = clientApi.payment.processPayment.useMutation();
  const completeServiceMutation = clientApi.payment.completeService.useMutation();

  const handleCreateTransaction = async (bargainId: string) => {
    try {
      await createTransactionMutation.mutateAsync({
        conversationId,
        bargainId
      });
      await refetchTransaction();
      toast.success('Service transaction created successfully!');
    } catch (error) {
      toast.error('Failed to create transaction. Please try again.');
    }
  };

  const handleProcessPayment = async () => {
    if (!transaction || !selectedPaymentMethod) return;

    setIsProcessingPayment(true);
    try {
      await processPaymentMutation.mutateAsync({
        transactionId: transaction.id,
        paymentMethod: selectedPaymentMethod as "card" | "wallet" | "bank_transfer"
      });
      await refetchTransaction();
      toast.success('Payment processed successfully!');
      onPaymentComplete?.();
    } catch (error: any) {
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCompleteService = async () => {
    if (!transaction) return;

    try {
      await completeServiceMutation.mutateAsync({
        transactionId: transaction.id
      });
      await refetchTransaction();
      toast.success('Service marked as complete!');
      onServiceComplete?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete service.');
    }
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PENDING:
        return <Badge variant="outline" className="text-orange-600 border-orange-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case PaymentStatus.PROCESSING:
        return <Badge variant="outline" className="text-blue-600 border-blue-600"><Clock className="w-3 h-3 mr-1" />Processing</Badge>;
      case PaymentStatus.COMPLETED:
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
      case PaymentStatus.FAILED:
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case PaymentStatus.REFUNDED:
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Refunded</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getServiceStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case ServiceStatus.ACTIVE:
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Active</Badge>;
      case ServiceStatus.COMPLETED:
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case ServiceStatus.CANCELLED:
        return <Badge variant="destructive">Cancelled</Badge>;
      case ServiceStatus.DISPUTED:
        return <Badge variant="destructive">Disputed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (!transaction) {
    return (
      <Card className="border-2 border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Service Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            A service transaction will be created automatically when the bargain is confirmed.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-green-600" />
            <span>Secure payment processing</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Service Payment
          </CardTitle>
          <div className="flex items-center gap-2">
            {getPaymentStatusBadge(transaction.paymentStatus)}
            {getServiceStatusBadge(transaction.serviceStatus)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Transaction Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Service Amount</span>
            <span className="text-lg font-bold text-green-600">
              ${transaction.amount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Service Provider</span>
            <span className="text-sm font-medium">
              {isSeeker ? otherUserName : 'You'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Client</span>
            <span className="text-sm font-medium">
              {isSeeker ? 'You' : otherUserName}
            </span>
          </div>
          {transaction.paymentRef && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Payment Reference</span>
              <span className="text-xs font-mono">{transaction.paymentRef}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Payment Section - Only for Seeker */}
        {isSeeker && transaction.paymentStatus === PaymentStatus.PENDING && (
          <div className="space-y-4">
            <h4 className="font-medium">Payment Method</h4>
            <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Choose payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Credit/Debit Card
                  </div>
                </SelectItem>
                <SelectItem value="wallet">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Digital Wallet
                  </div>
                </SelectItem>
                <SelectItem value="bank_transfer">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Bank Transfer
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={handleProcessPayment}
              disabled={!selectedPaymentMethod || isProcessingPayment}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isProcessingPayment ? 'Processing...' : `Pay $${transaction.amount.toFixed(2)}`}
            </Button>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Payment will be held securely until service completion</p>
              <p>• Helper will be notified once payment is confirmed</p>
              <p>• Full refund available if service is not delivered</p>
            </div>
          </div>
        )}

        {/* Payment Status for Helper */}
        {!isSeeker && transaction.paymentStatus === PaymentStatus.PENDING && (
          <div className="text-center py-4">
            <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="font-medium">Waiting for Payment</p>
            <p className="text-sm text-muted-foreground">
              {otherUserName} needs to complete the payment to proceed
            </p>
          </div>
        )}

        {/* Service Completion */}
        {transaction.paymentStatus === PaymentStatus.COMPLETED && 
         transaction.serviceStatus === ServiceStatus.ACTIVE && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">Payment Confirmed</p>
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    Service can now begin. Mark as complete when finished.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleCompleteService}
              disabled={completeServiceMutation.isPending}
              className="w-full"
            >
              {completeServiceMutation.isPending ? 'Completing...' : 'Mark Service as Complete'}
            </Button>
          </div>
        )}

        {/* Service Completed */}
        {transaction.serviceStatus === ServiceStatus.COMPLETED && (
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">Service Completed</p>
                <p className="text-sm text-green-700 dark:text-green-200">
                  Service was completed on {new Date(transaction.completedAt!).toLocaleDateString()}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Don&apos;t forget to rate your experience!
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
