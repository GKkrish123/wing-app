"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

interface DistanceFilterProps {
  selectedDistance: number;
  onDistanceChange: (distance: number) => void;
  className?: string;
}

const DISTANCE_OPTIONS = [
  { value: 1, label: '1 km', description: 'Very close' },
  { value: 5, label: '5 km', description: 'Nearby' },
  { value: 10, label: '10 km', description: 'Local area' },
  { value: 25, label: '25 km', description: 'City wide' },
  { value: 50, label: '50 km', description: 'Extended area' },
  { value: 100, label: '100 km', description: 'Regional' },
  { value: 200, label: '200 km', description: 'Long distance' },
  // { value: 100000, label: '100000 km', description: 'Worldwide' },
];

export function DistanceFilter({ 
  selectedDistance, 
  onDistanceChange, 
  className = '' 
}: DistanceFilterProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-medium text-sm">Search Distance</h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {DISTANCE_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={selectedDistance === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => onDistanceChange(option.value)}
            className="flex flex-col items-center p-3 h-auto"
          >
            <span className="font-semibold">{option.label}</span>
            <span className="text-xs opacity-75">{option.description}</span>
          </Button>
        ))}
      </div>
      
      <div className="text-xs text-muted-foreground text-center">
        Showing results within {selectedDistance} km of your location
      </div>
    </div>
  );
}
