"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { clientApi } from '@/trpc/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const feedbackSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  comment: z.string().optional(),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface MandatoryFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  otherUser: {
    id: string;
    name: string;
    profilePicture?: string | null;
  };
  role: 'seeker' | 'helper';
  requestTitle?: string;
  onFeedbackSubmitted?: () => void;
}

export function MandatoryFeedbackModal({
  isOpen,
  onClose,
  transactionId,
  otherUser,
  role,
  requestTitle,
  onFeedbackSubmitted
}: MandatoryFeedbackModalProps) {
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const submitFeedbackMutation = clientApi.payment.submitFeedback.useMutation();

  const onSubmit = async (data: FeedbackFormData) => {
    if (data.rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitFeedbackMutation.mutateAsync({
        transactionId,
        rating: data.rating,
        comment: data.comment || undefined,
      });

      toast.success('Thank you for your feedback!');
      onFeedbackSubmitted?.();
      onClose();
    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      return (
        <button
          key={index}
          type="button"
          onClick={() => {
            setSelectedRating(starValue);
            form.setValue('rating', starValue);
            form.clearErrors('rating');
          }}
          className={`p-1 transition-colors ${
            starValue <= selectedRating
              ? 'text-yellow-400'
              : 'text-gray-300 hover:text-yellow-300'
          }`}
        >
          <Star 
            className="w-8 h-8" 
            fill={starValue <= selectedRating ? 'currentColor' : 'none'}
          />
        </button>
      );
    });
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

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <DialogTitle>Feedback Required</DialogTitle>
            <Badge variant="destructive" className="text-xs">
              Mandatory
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Service Summary */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherUser.profilePicture || undefined} />
                <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-blue-900">
                  {role === 'seeker' ? 'Service received from' : 'Service provided to'} {otherUser.name}
                </p>
                {requestTitle && (
                  <p className="text-sm text-blue-700">{requestTitle}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <CheckCircle2 className="w-4 h-4" />
              <span>Service completed successfully</span>
            </div>
          </div>

          {/* Feedback Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Rating */}
              <FormField
                control={form.control}
                name="rating"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      How would you rate this {role === 'seeker' ? 'service' : 'experience'}?
                    </FormLabel>
                    <FormControl>
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex gap-1">
                          {renderStars()}
                        </div>
                        {selectedRating > 0 && (
                          <p className="text-sm font-medium text-center">
                            {getRatingText(selectedRating)} ({selectedRating}/5)
                          </p>
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
                    <FormLabel>
                      Additional Comments (Optional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={`Share your experience with ${otherUser.name}...`}
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Warning Message */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Feedback is mandatory</p>
                    <p>
                      You must provide feedback to complete this transaction. 
                      This helps maintain service quality in our community.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || selectedRating === 0}
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting Feedback...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
