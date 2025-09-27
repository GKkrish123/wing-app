"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Star, 
  MessageCircle, 
  Clock,
  User,
  Award
} from 'lucide-react';

interface Helper {
  id: string;
  name: string;
  profilePicture: string | null;
  averageRating?: number;
  expertise: Array<{
    skillName: string;
    description?: string;
  }>;
  distance: number; // in km
  isOnline?: boolean;
  responseTime?: string; // e.g., "Usually responds within 30 mins"
  completedJobs?: number;
}

interface HelperListProps {
  helpers: Helper[];
  onSelectHelper: (helper: Helper) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function HelperList({ 
  helpers, 
  onSelectHelper, 
  loading = false,
  emptyMessage = "No helpers found in your area"
}: HelperListProps) {
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
                  <div className="flex gap-2">
                    <div className="h-6 bg-muted rounded w-16"></div>
                    <div className="h-6 bg-muted rounded w-20"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (helpers.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No Helpers Found</h3>
        <p className="text-muted-foreground">{emptyMessage}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Try increasing your search distance or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {helpers.map((helper) => (
        <Card key={helper.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={helper.profilePicture || ''} alt={helper.name} />
                  <AvatarFallback>
                    {helper.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {helper.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>

              {/* Helper Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground truncate">
                      {helper.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{helper.distance.toFixed(1)} km away</span>
                      {helper.isOnline && (
                        <>
                          <span>•</span>
                          <span className="text-green-600">Online</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Rating */}
                  {helper.averageRating && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{helper.averageRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Expertise Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {helper.expertise.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill.skillName}
                    </Badge>
                  ))}
                  {helper.expertise.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{helper.expertise.length - 3} more
                    </Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  {helper.completedJobs && (
                    <div className="flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      <span>{helper.completedJobs} jobs completed</span>
                    </div>
                  )}
                  {helper.responseTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{helper.responseTime}</span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <Button 
                  onClick={() => onSelectHelper(helper)}
                  size="sm"
                  className="w-full"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Conversation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
