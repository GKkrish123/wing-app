"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, User, MessageSquare } from 'lucide-react';
import { clientApi } from '@/trpc/react';
import { toast } from 'sonner';

const ratingFormSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

type RatingFormData = z.infer<typeof ratingFormSchema>;

interface RatingFeedbackProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
  otherUser: {
    id: string;
    name: string;
  };
  isSeeker: boolean;
  onRatingSubmitted?: () => void;
}

export function RatingFeedback({
  isOpen,
  onOpenChange,
  transactionId,
  otherUser,
  isSeeker,
  onRatingSubmitted
}: RatingFeedbackProps) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const form = useForm<RatingFormData>({
    resolver: zodResolver(ratingFormSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const submitRatingMutation = clientApi.payment.submitRating.useMutation();

  const onSubmit = async (data: RatingFormData) => {
    try {
      await submitRatingMutation.mutateAsync({
        transactionId,
        toUserId: otherUser.id,
        rating: data.rating,
        comment: data.comment,
      });

      toast.success('Thank you for your feedback!');
      onRatingSubmitted?.();
      onOpenChange(false);
      form.reset();
      setSelectedRating(0);
      setHoverRating(0);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit rating');
    }
  };

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
    form.setValue('rating', rating);
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  const displayRating = hoverRating || selectedRating || form.watch('rating') || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Rate Your Experience
          </DialogTitle>
          <DialogDescription>
            How was your experience with {otherUser.name}? Your feedback helps improve our community.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-medium">{otherUser.name}</p>
                  <Badge variant="secondary" className="text-xs">
                    {isSeeker ? 'Service Provider' : 'Client'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Star Rating */}
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Rating</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleStarClick(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="p-1 hover:scale-110 transition-transform"
                            >
                              <Star
                                className={`w-8 h-8 transition-colors ${
                                  star <= displayRating
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        {displayRating > 0 && (
                          <div className="text-center">
                            <Badge variant="outline" className="text-sm">
                              {displayRating} star{displayRating !== 1 ? 's' : ''} - {getRatingText(displayRating)}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Comment */}
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Additional Comments (Optional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={`Share your experience with ${otherUser.name}...`}
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Skip for Now
                </Button>
                <Button
                  type="submit"
                  disabled={selectedRating === 0 || submitRatingMutation.isPending}
                  className="flex-1"
                >
                  {submitRatingMutation.isPending ? 'Submitting...' : 'Submit Rating'}
                </Button>
              </div>
            </form>
          </Form>

          {/* Privacy Note */}
          <div className="text-xs text-muted-foreground text-center border-t pt-4">
            <p>Your rating and feedback will be visible to other users to help them make informed decisions.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ExistingRatingsProps {
  ratings: Array<{
    id: string;
    ratingValue: number;
    comment?: string;
    createdAt: string;
    fromUser: {
      id: string;
      name: string;
    };
  }>;
}

export function ExistingRatings({ ratings }: ExistingRatingsProps) {
  if (ratings.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <Star className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No ratings yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {ratings.map((rating) => (
        <Card key={rating.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-foreground">
                    {rating.fromUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="font-medium text-sm">{rating.fromUser.name}</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= rating.ratingValue
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            {rating.comment && (
              <p className="text-sm text-muted-foreground mb-2">{rating.comment}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {new Date(rating.createdAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
