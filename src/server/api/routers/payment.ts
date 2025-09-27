import { z } from "zod";
import { authroizedProcedure, createTRPCRouter } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { BargainStatus, PaymentStatus, RequestStatus, ServiceStatus } from "@prisma/client";

export const paymentRouter = createTRPCRouter({
  // Get pending feedback transactions for a user
  getPendingFeedbacks: authroizedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.supabaseUser!.id;
      
      // Get transactions where the user hasn't provided feedback yet
      const pendingAsSeeker = await ctx.db.serviceTransaction.findMany({
        where: {
          seekerId: userId,
          serviceStatus: ServiceStatus.COMPLETED,
          seekerFeedbackProvided: false,
        },
        include: {
          conversation: {
            include: {
              helper: {
                select: { id: true, name: true, profilePicture: true }
              },
              request: {
                select: { id: true, title: true, description: true }
              }
            }
          }
        },
        orderBy: { completedAt: 'desc' }
      });

      const pendingAsHelper = await ctx.db.serviceTransaction.findMany({
        where: {
          helperId: userId,
          serviceStatus: ServiceStatus.COMPLETED,
          helperFeedbackProvided: false,
        },
        include: {
          conversation: {
            include: {
              seeker: {
                select: { id: true, name: true, profilePicture: true }
              },
              request: {
                select: { id: true, title: true, description: true }
              }
            }
          }
        },
        orderBy: { completedAt: 'desc' }
      });

      return {
        asSeeker: pendingAsSeeker.map(tx => ({
          ...tx,
          otherUser: tx.conversation.helper,
          role: 'seeker' as const
        })),
        asHelper: pendingAsHelper.map(tx => ({
          ...tx,
          otherUser: tx.conversation.seeker,
          role: 'helper' as const
        }))
      };
    }),

  // Submit feedback and update completion status
  submitFeedback: authroizedProcedure
    .input(z.object({
      transactionId: z.string(),
      rating: z.number().min(1).max(5),
      comment: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.supabaseUser!.id;

      // Get transaction and verify user is part of it
      const transaction = await ctx.db.serviceTransaction.findUnique({
        where: { id: input.transactionId },
        include: {
          conversation: {
            include: {
              seeker: { select: { id: true } },
              helper: { select: { id: true } }
            }
          }
        }
      });

      if (!transaction) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Transaction not found" });
      }

      if (transaction.conversation.seekerId !== userId && transaction.conversation.helperId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
      }

      if (transaction.serviceStatus !== ServiceStatus.COMPLETED) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Service must be completed to provide feedback" });
      }

      const isSeeker = transaction.conversation.seekerId === userId;
      const otherUserId = isSeeker ? transaction.conversation.helperId : transaction.conversation.seekerId;

      // Check if user has already provided feedback
      if ((isSeeker && transaction.seekerFeedbackProvided) || 
          (!isSeeker && transaction.helperFeedbackProvided)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Feedback already provided" });
      }

      // Create the rating
      await ctx.db.rating.create({
        data: {
          ratingValue: input.rating,
          comment: input.comment,
          fromUserId: userId,
          toUserId: otherUserId,
          transactionId: input.transactionId,
        }
      });

      // Update feedback completion status
      const updateData: any = isSeeker ? {
        seekerFeedbackProvided: true,
        seekerFeedbackAt: new Date(),
      } : {
        helperFeedbackProvided: true,
        helperFeedbackAt: new Date(),
      };

      // Check if this completes both feedbacks
      const otherFeedbackProvided = isSeeker ? 
        transaction.helperFeedbackProvided : 
        transaction.seekerFeedbackProvided;

      if (otherFeedbackProvided) {
        (updateData as any).bothFeedbacksCompleted = true;
      }

      const updatedTransaction = await ctx.db.serviceTransaction.update({
        where: { id: input.transactionId },
        data: updateData
      });

      return updatedTransaction;
    }),
  // Create service transaction when bargain is confirmed
  createServiceTransaction: authroizedProcedure
    .input(z.object({ 
      conversationId: z.string(),
      bargainId: z.string() 
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.supabaseUser!.id;

      // Verify bargain is confirmed
      const bargain = await ctx.db.bargain.findUnique({
        where: { id: input.bargainId },
        include: {
          conversation: {
            include: {
              seeker: true,
              helper: true,
            }
          }
        }
      });

      if (!bargain || bargain.status !== BargainStatus.CONFIRMED) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "Bargain must be confirmed before creating transaction" 
        });
      }

      // Verify user is part of the conversation
      if (bargain.conversation.seekerId !== userId && bargain.conversation.helperId !== userId) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "You are not part of this conversation" 
        });
      }

      // Check if transaction already exists
      const existingTransaction = await ctx.db.serviceTransaction.findUnique({
        where: { conversationId: input.conversationId }
      });

      if (existingTransaction) {
        return existingTransaction;
      }

      // Create service transaction
      const transaction = await ctx.db.serviceTransaction.create({
        data: {
          conversationId: input.conversationId,
          amount: bargain.currentAmount,
          seekerId: bargain.conversation.seekerId,
          helperId: bargain.conversation.helperId,
          serviceStatus: ServiceStatus.ACTIVE,
          paymentStatus: PaymentStatus.PENDING,
        },
        include: {
          seeker: { select: { id: true, name: true } },
          helper: { select: { id: true, name: true } },
          conversation: true,
        }
      });

      return transaction;
    }),

  // Get service transaction for conversation
  getServiceTransaction: authroizedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.supabaseUser!.id;

      const transaction = await ctx.db.serviceTransaction.findUnique({
        where: { conversationId: input.conversationId },
        include: {
          seeker: { select: { id: true, name: true } },
          helper: { select: { id: true, name: true } },
          conversation: true,
          ratings: {
            include: {
              fromUser: { select: { id: true, name: true } },
              toUser: { select: { id: true, name: true } }
            }
          }
        }
      });

      if (!transaction) {
        return null;
      }

      // Verify user is part of the transaction
      if (transaction.seekerId !== userId && transaction.helperId !== userId) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "You are not part of this transaction" 
        });
      }

      return transaction;
    }),

  // Process payment (mock implementation)
  processPayment: authroizedProcedure
    .input(z.object({ 
      transactionId: z.string(),
      paymentMethod: z.enum(["card", "wallet", "bank_transfer"])
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.supabaseUser!.id;

      const transaction = await ctx.db.serviceTransaction.findUnique({
        where: { id: input.transactionId },
        select: {
          seekerId: true,
          helperId: true,
          paymentStatus: true,
          serviceStatus: true,
          conversation: {
            select: {
              requestId: true,
            }
          }
        }
      });

      if (!transaction) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Transaction not found" });
      }

      // Only seeker can initiate payment
      if (transaction.seekerId !== userId) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "Only the seeker can initiate payment" 
        });
      }

      if (transaction.paymentStatus !== PaymentStatus.PENDING) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "Payment has already been processed" 
        });
      }

      // Mock payment processing - in real app, integrate with payment gateway
      const paymentRef = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Simulate payment processing
      const isPaymentSuccessful = true; // 100% success rate for demo

      const updatedTransaction = await ctx.db.serviceTransaction.update({
        where: { id: input.transactionId },
        data: {
          paymentStatus: isPaymentSuccessful ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
          paymentMethod: input.paymentMethod,
          paymentRef: paymentRef,
        }
      });

      if (isPaymentSuccessful) {
        await ctx.db.request.update({
          where: { id: transaction.conversation.requestId },
          data: {
            status: RequestStatus.CONFIRMED,
          }
        });
      }

      if (!isPaymentSuccessful) {
        throw new TRPCError({ 
          code: "INTERNAL_SERVER_ERROR", 
          message: "Payment processing failed. Please try again." 
        });
      }

      return updatedTransaction;
    }),

  // Complete service (can be called by either party)
  completeService: authroizedProcedure
    .input(z.object({ transactionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.supabaseUser!.id;

      const transaction = await ctx.db.serviceTransaction.findUnique({
        where: { id: input.transactionId },
        select: {
          seekerId: true,
          helperId: true,
          paymentStatus: true,
          serviceStatus: true,
          conversation: {
            select: {
              requestId: true,
            }
          }
        }
      });

      if (!transaction) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Transaction not found" });
      }

      // Verify user is part of the transaction
      if (transaction.seekerId !== userId && transaction.helperId !== userId) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "You are not part of this transaction" 
        });
      }

      if (transaction.serviceStatus !== ServiceStatus.ACTIVE) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "Service is not active" 
        });
      }

      // Payment should be completed before service completion
      if (transaction.paymentStatus !== PaymentStatus.COMPLETED) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "Payment must be completed before service completion" 
        });
      }

      const completedTransaction = await ctx.db.serviceTransaction.update({
        where: { id: input.transactionId },
        data: {
          serviceStatus: ServiceStatus.COMPLETED,
          completedAt: new Date(),
          completedBy: userId,
        }
      });

      await ctx.db.request.update({
        where: { id: transaction.conversation.requestId },
        data: {
          status: RequestStatus.COMPLETED,
        }
      });

      return completedTransaction;
    }),

  // Submit rating and feedback
  submitRating: authroizedProcedure
    .input(z.object({
      transactionId: z.string(),
      toUserId: z.string(),
      rating: z.number().min(1).max(5),
      comment: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.supabaseUser!.id;

      const transaction = await ctx.db.serviceTransaction.findUnique({
        where: { id: input.transactionId }
      });

      if (!transaction) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Transaction not found" });
      }

      // Verify user is part of the transaction
      if (transaction.seekerId !== userId && transaction.helperId !== userId) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "You are not part of this transaction" 
        });
      }

      // Verify target user is the other party
      const expectedToUserId = transaction.seekerId === userId ? transaction.helperId : transaction.seekerId;
      if (input.toUserId !== expectedToUserId) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "Invalid rating target" 
        });
      }

      // Check if rating already exists
      const existingRating = await ctx.db.rating.findFirst({
        where: {
          transactionId: input.transactionId,
          fromUserId: userId,
          toUserId: input.toUserId,
        }
      });

      if (existingRating) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "You have already rated this transaction" 
        });
      }

      // Create rating
      const rating = await ctx.db.rating.create({
        data: {
          transactionId: input.transactionId,
          fromUserId: userId,
          toUserId: input.toUserId,
          ratingValue: input.rating,
          comment: input.comment,
        },
        include: {
          fromUser: { select: { id: true, name: true } },
          toUser: { select: { id: true, name: true } }
        }
      });

      // Update user's average rating
      const userRatings = await ctx.db.rating.findMany({
        where: { toUserId: input.toUserId },
        select: { ratingValue: true }
      });

      const averageRating = userRatings.reduce((sum, r) => sum + r.ratingValue, 0) / userRatings.length;

      // Update both helper and seeker profiles if they exist
      await Promise.allSettled([
        ctx.db.helperProfile.updateMany({
          where: { userId: input.toUserId },
          data: { averageRating }
        }),
        ctx.db.seekerProfile.updateMany({
          where: { userId: input.toUserId },
          data: { averageRating }
        })
      ]);

      return rating;
    }),

  // Get user's transaction history
  getTransactionHistory: authroizedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.supabaseUser!.id;

      const transactions = await ctx.db.serviceTransaction.findMany({
        where: {
          OR: [
            { seekerId: userId },
            { helperId: userId }
          ]
        },
        include: {
          seeker: { select: { id: true, name: true } },
          helper: { select: { id: true, name: true } },
          conversation: {
            include: {
              request: { select: { title: true, description: true } }
            }
          },
          ratings: {
            include: {
              fromUser: { select: { id: true, name: true } },
              toUser: { select: { id: true, name: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return transactions;
    }),
});
