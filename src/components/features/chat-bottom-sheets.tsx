"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { 
  DollarSign, 
  MapPin, 
  CreditCard,
  Bell,
  ChevronUp,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { BargainDrawer } from './bargain-drawer';
import { LocationSharing } from './location-sharing';
import { PaymentFlow } from './payment-flow';
import { MapViewPopup } from './map-view-popup';

interface ChatBottomDrawersProps {
  conversationId: string;
  isSeeker: boolean;
  otherUserName: string;
  currentBargain?: any;
  serviceTransaction?: any;
  locationData?: {
    currentUser: {
      isSharing: boolean;
      latitude: number | null;
      longitude: number | null;
      accuracy: number | null;
      sharedAt: Date | null;
      updatedAt: Date;
    } | null;
    otherUser: {
      userId: string;
      name: string;
      isSharing: boolean;
      latitude: number | null;
      longitude: number | null;
      accuracy: number | null;
      sharedAt: Date | null;
      updatedAt: Date;
    } | null;
  };
}

export function ChatBottomDrawers({
  conversationId,
  isSeeker,
  otherUserName,
  currentBargain,
  serviceTransaction,
  locationData
}: ChatBottomDrawersProps) {
  const [activeBargainDrawer, setActiveBargainDrawer] = useState(false);
  const [activePaymentDrawer, setActivePaymentDrawer] = useState(false);
  const [activeLocationDrawer, setActiveLocationDrawer] = useState(false);
  const [showMapView, setShowMapView] = useState(false);

  // Determine notification states
  const bargainNotification = currentBargain && (
    (currentBargain.status === 'PENDING_HELPER_RESPONSE' && !isSeeker) ||
    (currentBargain.status === 'PENDING_SEEKER_RESPONSE' && isSeeker) ||
    (currentBargain.status === 'AGREED' && isSeeker) // Seeker needs to confirm
  );

  const paymentNotification = currentBargain?.status === 'CONFIRMED' && 
    serviceTransaction && serviceTransaction.paymentStatus === 'PENDING';

  const locationNotification = currentBargain?.status === 'CONFIRMED' && 
    serviceTransaction?.paymentStatus === 'COMPLETED' && 
    (!locationData?.currentUser?.isSharing || !locationData?.otherUser?.isSharing);

  const canShowMapView = locationData?.currentUser?.isSharing && 
    locationData?.otherUser?.isSharing &&
    locationData?.currentUser?.latitude && 
    locationData?.currentUser?.longitude &&
    locationData?.otherUser?.latitude && 
    locationData?.otherUser?.longitude;

  return (
    <>
      {/* Bottom Action Bar */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-around p-3 gap-2">
          
          {/* Bargain Drawer */}
          <Drawer open={activeBargainDrawer} onOpenChange={setActiveBargainDrawer}>
            <DrawerTrigger asChild>
              <Button 
                variant={bargainNotification ? "default" : "outline"} 
                size="sm"
                className={`flex-1 relative ${bargainNotification ? 'animate-pulse' : ''}`}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Bargain
                {bargainNotification && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500">
                    <Bell className="w-3 h-3" />
                  </Badge>
                )}
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[80vh]">
              <DrawerHeader>
                <DrawerTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Bargaining
                  {bargainNotification && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Action Required
                    </Badge>
                  )}
                </DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-4 overflow-y-auto max-h-[calc(80vh-100px)]">
                <BargainDrawer
                  conversationId={conversationId}
                  currentUserId={""} // Will be handled internally
                  isSeeker={isSeeker}
                  isOpen={true}
                  onOpenChange={() => {}} // Controlled by drawer
                />
              </div>
            </DrawerContent>
          </Drawer>

          {/* Payment Drawer */}
          {currentBargain?.status === 'CONFIRMED' && (
            <Drawer open={activePaymentDrawer} onOpenChange={setActivePaymentDrawer}>
              <DrawerTrigger asChild>
                <Button 
                  variant={paymentNotification ? "default" : "outline"} 
                  size="sm"
                  className={`flex-1 relative ${paymentNotification ? 'animate-pulse' : ''}`}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Payment
                  {paymentNotification && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500">
                      <Bell className="w-3 h-3" />
                    </Badge>
                  )}
                </Button>
              </DrawerTrigger>
              <DrawerContent className="h-[70vh]">
                <DrawerHeader>
                  <DrawerTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment & Service
                    {paymentNotification && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Payment Pending
                      </Badge>
                    )}
                  </DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-4 overflow-y-auto max-h-[calc(70vh-100px)]">
                  {serviceTransaction && (
                    <PaymentFlow
                      conversationId={conversationId}
                      bargainAmount={currentBargain.currentAmount}
                      otherUserName={otherUserName}
                      isSeeker={isSeeker}
                    />
                  )}
                </div>
              </DrawerContent>
            </Drawer>
          )}

          {/* Location Sharing Drawer */}
          {currentBargain?.status === 'CONFIRMED' && 
           serviceTransaction?.paymentStatus === 'COMPLETED' && (
            <Drawer open={activeLocationDrawer} onOpenChange={setActiveLocationDrawer}>
              <DrawerTrigger asChild>
                <Button 
                  variant={locationNotification ? "default" : "outline"} 
                  size="sm"
                  className={`flex-1 relative ${locationNotification ? 'animate-pulse' : ''}`}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Location
                  {locationNotification && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500">
                      <Bell className="w-3 h-3" />
                    </Badge>
                  )}
                  {locationData?.currentUser?.isSharing && locationData?.otherUser?.isSharing && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-green-500">
                      <CheckCircle2 className="w-3 h-3" />
                    </Badge>
                  )}
                </Button>
              </DrawerTrigger>
              <DrawerContent className="h-[70vh]">
                <DrawerHeader>
                  <DrawerTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Location Sharing
                    {locationNotification && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Share Location
                      </Badge>
                    )}
                    {locationData?.currentUser?.isSharing && locationData?.otherUser?.isSharing && (
                      <Badge variant="default" className="bg-green-600 text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Both Sharing
                      </Badge>
                    )}
                  </DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-4 overflow-y-auto max-h-[calc(70vh-140px)]">
                  <LocationSharing
                    conversationId={conversationId}
                    isSeeker={isSeeker}
                    otherUserName={otherUserName}
                    bargainAmount={currentBargain.currentAmount}
                  />
                  
                  {/* Map View Button */}
                  {canShowMapView && (
                    <div className="mt-4 pt-4 border-t">
                      <Button 
                        onClick={() => setShowMapView(true)}
                        className="w-full"
                        size="lg"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        View Live Map
                      </Button>
                    </div>
                  )}
                </div>
              </DrawerContent>
            </Drawer>
          )}
        </div>
      </div>

      {/* Map View Popup */}
      {canShowMapView && locationData?.currentUser && locationData?.otherUser && (
        <MapViewPopup
          isOpen={showMapView}
          onClose={() => setShowMapView(false)}
          currentUserLocation={{
            latitude: locationData.currentUser.latitude!,
            longitude: locationData.currentUser.longitude!,
            updatedAt: locationData.currentUser.updatedAt.toISOString()
          }}
          otherUserLocation={{
            latitude: locationData.otherUser.latitude!,
            longitude: locationData.otherUser.longitude!,
            name: locationData.otherUser.name,
            updatedAt: locationData.otherUser.updatedAt.toISOString()
          }}
          conversationId={conversationId}
        />
      )}
    </>
  );
}
