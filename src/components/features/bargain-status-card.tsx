"use client";

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  CheckCircle, 
  Clock, 
  Handshake,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { BargainStatus } from '@prisma/client';

interface BargainStatusCardProps {
  bargain: {
    id: string;
    currentAmount: number;
    status: BargainStatus;
    helperApproved: boolean;
    seekerApproved: boolean;
    isConfirmed: boolean;
    initiator: { name: string };
    conversation: {
      seeker: { id: string; name: string };
      helper: { id: string; name: string };
    };
  };
  currentUserId: string;
  onOpenBargainDrawer: () => void;
}

export function BargainStatusCard({ 
  bargain, 
  currentUserId, 
  onOpenBargainDrawer 
}: BargainStatusCardProps) {
  const isSeeker = bargain.conversation.seeker.id === currentUserId;
  
  const getStatusIcon = () => {
    switch (bargain.status) {
      case BargainStatus.PENDING_HELPER_RESPONSE:
      case BargainStatus.PENDING_SEEKER_RESPONSE:
        return <Clock className="w-4 h-4 text-orange-600" />;
      case BargainStatus.AGREED:
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case BargainStatus.CONFIRMED:
        return <Handshake className="w-4 h-4 text-blue-600" />;
      case BargainStatus.CANCELLED:
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = () => {
    switch (bargain.status) {
      case BargainStatus.PENDING_HELPER_RESPONSE:
        return 'Waiting for helper response';
      case BargainStatus.PENDING_SEEKER_RESPONSE:
        return 'Waiting for seeker response';
      case BargainStatus.AGREED:
        return isSeeker ? 'Ready to confirm deal' : 'Waiting for seeker to confirm';
      case BargainStatus.CONFIRMED:
        return 'Deal confirmed - proceed with service';
      case BargainStatus.CANCELLED:
        return 'Bargain cancelled';
      default:
        return 'Unknown status';
    }
  };

  const getStatusColor = () => {
    switch (bargain.status) {
      case BargainStatus.PENDING_HELPER_RESPONSE:
      case BargainStatus.PENDING_SEEKER_RESPONSE:
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case BargainStatus.AGREED:
        return 'bg-green-50 border-green-200 text-green-800';
      case BargainStatus.CONFIRMED:
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case BargainStatus.CANCELLED:
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <Card className={`${getStatusColor()} border-2`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-full">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-lg">
                  ${bargain.currentAmount.toFixed(2)}
                </span>
                {getStatusIcon()}
              </div>
              <p className="text-sm font-medium mb-1">
                {getStatusText()}
              </p>
              <p className="text-xs opacity-75">
                Proposed by {bargain.initiator.name}
              </p>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onOpenBargainDrawer}
            className="bg-white/80 hover:bg-white"
          >
            View Details
          </Button>
        </div>
        
        {/* Approval indicators */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/30">
          <div className="flex items-center gap-1 text-xs">
            {bargain.helperApproved ? (
              <CheckCircle className="w-3 h-3 text-green-600" />
            ) : (
              <Clock className="w-3 h-3 text-orange-600" />
            )}
            <span>Helper</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            {bargain.seekerApproved ? (
              <CheckCircle className="w-3 h-3 text-green-600" />
            ) : (
              <Clock className="w-3 h-3 text-orange-600" />
            )}
            <span>Seeker</span>
          </div>
          {bargain.status === BargainStatus.AGREED && isSeeker && (
            <Badge variant="secondary" className="text-xs">
              Ready to confirm
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
