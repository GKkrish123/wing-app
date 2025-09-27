"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation, 
  Phone,
  MessageCircle,
  Clock,
  DollarSign,
  User,
  ArrowLeft
} from 'lucide-react';

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface ConfirmedBargainMapProps {
  conversationId: string;
  isSeeker: boolean;
  otherUser: {
    id: string;
    name: string;
    profilePicture?: string;
    phone?: string;
  };
  bargainAmount: number;
  myLocation: Location;
  otherLocation: Location;
  onBack: () => void;
  onCompleteService?: () => void;
}

export function ConfirmedBargainMap({
  conversationId,
  isSeeker,
  otherUser,
  bargainAmount,
  myLocation,
  otherLocation,
  onBack,
  onCompleteService
}: ConfirmedBargainMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    // Calculate distance between locations
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371; // Earth's radius in kilometers
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    const dist = calculateDistance(
      myLocation.latitude,
      myLocation.longitude,
      otherLocation.latitude,
      otherLocation.longitude
    );
    setDistance(dist);
  }, [myLocation, otherLocation]);

  const openInMaps = () => {
    const destination = `${otherLocation.latitude},${otherLocation.longitude}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(url, '_blank');
  };

  const callOtherUser = () => {
    if (otherUser.phone) {
      window.location.href = `tel:${otherUser.phone}`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold">Service Location</h2>
          <p className="text-sm text-muted-foreground">
            Confirmed deal with {otherUser.name}
          </p>
        </div>
        <Badge variant="default" className="bg-green-600">
          ${bargainAmount.toFixed(2)}
        </Badge>
      </div>

      {/* Location Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* My Location */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              Your Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>
                  {myLocation.address || `${myLocation.latitude.toFixed(6)}, ${myLocation.longitude.toFixed(6)}`}
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                {isSeeker ? 'Service Location' : 'Your Position'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Other User's Location */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {otherUser.name.charAt(0).toUpperCase()}
                </div>
              </div>
              {otherUser.name}&apos;s Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>
                  {otherLocation.address || `${otherLocation.latitude.toFixed(6)}, ${otherLocation.longitude.toFixed(6)}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {isSeeker ? 'Helper Location' : 'Service Location'}
                </Badge>
                {distance && (
                  <Badge variant="secondary" className="text-xs">
                    {distance < 1 ? `${(distance * 1000).toFixed(0)}m away` : `${distance.toFixed(1)}km away`}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map Placeholder */}
      <Card>
        <CardContent className="p-6">
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Interactive Map</p>
              <p className="text-sm text-gray-500 mt-1">
                Map integration coming soon
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button onClick={openInMaps} className="bg-blue-600 hover:bg-blue-700">
          <Navigation className="w-4 h-4 mr-2" />
          Get Directions
        </Button>

        {otherUser.phone && (
          <Button variant="outline" onClick={callOtherUser}>
            <Phone className="w-4 h-4 mr-2" />
            Call {otherUser.name}
          </Button>
        )}

        <Button variant="outline">
          <MessageCircle className="w-4 h-4 mr-2" />
          Send Message
        </Button>
      </div>

      {/* Service Completion */}
      {isSeeker && onCompleteService && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-green-900">Service Complete?</h3>
                <p className="text-sm text-green-700 mt-1">
                  Mark as complete when the service is finished
                </p>
              </div>
              <Button 
                onClick={onCompleteService}
                className="bg-green-600 hover:bg-green-700"
              >
                Complete Service
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Service Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Agreed Amount</span>
            <span className="font-semibold">${bargainAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Service Provider</span>
            <span className="font-medium">{isSeeker ? otherUser.name : 'You'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Service Requester</span>
            <span className="font-medium">{isSeeker ? 'You' : otherUser.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant="default" className="bg-blue-600">In Progress</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
